const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const PODCASTS_DIR = path.resolve(__dirname, '../../lennys-newsletterpodcastdata/podcasts');
const OUTPUT_FILE = path.resolve(__dirname, '../public/summaries.json');

// ── Parsing ──────────────────────────────────────────────────────────────────

function parseTranscript(content) {
  const blocks = [];
  const lines = content.split('\n');
  let currentSpeaker = null;
  let currentLines = [];

  for (const line of lines) {
    const match = line.match(/^\*\*(.+?)\*\*\s*\(\d{2}:\d{2}:\d{2}\):\s*$/);
    if (match) {
      if (currentSpeaker && currentLines.length > 0) {
        blocks.push({ speaker: currentSpeaker, text: currentLines.join(' ').trim() });
      }
      currentSpeaker = match[1].trim();
      currentLines = [];
    } else if (line.trim()) {
      currentLines.push(line.trim());
    }
  }
  if (currentSpeaker && currentLines.length > 0) {
    blocks.push({ speaker: currentSpeaker, text: currentLines.join(' ').trim() });
  }
  return blocks;
}

function getGuestStatements(blocks, cleanGuestNames) {
  return blocks.filter(b => {
    if (b.speaker === 'Lenny Rachitsky') return false;
    if (b.text.length <= 30) return false;
    return cleanGuestNames.some(name =>
      b.speaker === name ||
      b.speaker.startsWith(name.split(' ')[0])
    );
  });
}

// ── Text Processing ──────────────────────────────────────────────────────────

function cleanText(s) {
  return s
    .replace(/\[inaudible[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert first-person statements to third-person for use in summaries.
 * Focuses on removing first-person openers to make the sentence work
 * after a preamble like "Marc argues that..."
 */
function toThirdPerson(s, displayName) {
  let result = s;
  // Remove "I think" / "I believe" / "I would say" / "I feel like" openers
  result = result.replace(/^I (think|believe|would say|would argue|feel like|feel)\s+(that\s+)?/i, '');
  // Remove "In my view," / "In my experience," openers
  result = result.replace(/^In my (view|opinion|experience),?\s*/i, '');
  // Remove "It was really clear in my mind that" -> just the rest
  result = result.replace(/^It was (really )?clear (in my mind |to me )that\s*/i, '');
  // Remove "I thought" / "I felt" openers when followed by content
  result = result.replace(/^I (thought|felt|realized|noticed|saw|found)\s+(that\s+)?/i, '');
  // Remove mid-sentence ", I think," / ", I believe,"
  result = result.replace(/,?\s*I (think|believe),?\s*/gi, ' ');
  // Don't replace "my" globally -- it's too aggressive. Only replace obvious patterns.
  result = result.replace(/^My (view|take|argument|thesis|point|belief|sense) is/i, 'the $1 is');
  // "in my mind" / "in my experience" mid-sentence
  result = result.replace(/in my (mind|view|opinion)/gi, 'in their view');
  result = result.replace(/in my (previous |past |last )?roles?/gi, 'in previous roles');
  // Remove "I thought/felt X" -> just X
  result = result.replace(/^I (thought|felt) (that )?/i, '');
  // "I" as subject at start -> remove the "I" phrasing entirely if followed by a verb
  result = result.replace(/^I (would|could|do|don't|am|have|had|was|just|love|usually|spend)\s/i, (match, verb) => {
    return verb.toLowerCase() + ' ';
  });
  // "The way I think about this" -> "The way to think about this"
  result = result.replace(/the way I (think|look) about/gi, 'the way to think about');
  // Remove sentences that are still dominated by first-person after cleanup
  // (if more than 30% of words are I/me/my/we, it's too personal for a summary)
  // Clean up
  result = result.replace(/\s+/g, ' ').trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
}

function cleanForTakeaway(s) {
  let cleaned = cleanText(s);

  // Remove leading filler/connective words (multiple passes)
  for (let i = 0; i < 3; i++) {
    cleaned = cleaned.replace(
      /^(And then\s+|And so\s+|And\s+|So\s+|But\s+|Yeah,?\s*so\s+|Yeah,?\s*|Well,?\s*so\s+|Well,?\s*|I mean,?\s*|Look,?\s*|Right,?\s*so\s+|Okay,?\s*so\s+|Okay,?\s*|Like,?\s*|Because\s+)/i,
      ''
    );
  }

  if (cleaned.length === 0) return '';
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  if (!/[.!?]$/.test(cleaned)) cleaned += '.';
  return cleaned;
}

function splitSentences(text) {
  // Split on sentence boundaries: period/exclamation/question followed by space+capital
  const parts = [];
  const cleaned = cleanText(text);
  // Use a regex that splits on sentence-ending punctuation followed by a space and uppercase letter
  let remaining = cleaned;
  const sentenceEnd = /([.!?])\s+(?=[A-Z"'])/g;
  let lastIndex = 0;
  let match;

  while ((match = sentenceEnd.exec(cleaned)) !== null) {
    const sentence = cleaned.slice(lastIndex, match.index + 1).trim();
    if (sentence.length > 10) parts.push(sentence);
    lastIndex = match.index + match[0].length - 1;
  }
  // Remainder
  const remainder = cleaned.slice(lastIndex).trim();
  if (remainder.length > 10) parts.push(remainder);

  return parts.length > 0 ? parts : [cleaned];
}

// ── Scoring for Takeaways ────────────────────────────────────────────────────

function scoreSentence(sentence) {
  let score = 0;
  const len = sentence.length;

  // Sweet spot: 80-250 chars makes a good standalone takeaway
  if (len >= 80 && len <= 250) score += 4;
  else if (len >= 60 && len <= 350) score += 2;
  else if (len < 40) score -= 4;
  else if (len > 450) score -= 2;

  // Contains numbers/data (very specific = good)
  if (/\d+%/.test(sentence)) score += 5;
  if (/\d{2,}/.test(sentence) && !/\d{2}:\d{2}/.test(sentence)) score += 2;
  if (/\$\d/.test(sentence)) score += 3;

  // Strong claim / framework language
  const strongPatterns = [
    /the key (is|to)/i, /the secret (is|to)/i, /the trick (is|to)/i,
    /the biggest mistake/i, /the most important/i,
    /what most people (get wrong|miss|don't|think)/i,
    /the best way to/i, /rule of thumb/i, /framework/i, /principle/i,
    /the only (way|thing|time)/i, /the difference between/i,
    /what (really|actually) matters/i, /the problem (is|with)/i,
  ];
  for (const p of strongPatterns) {
    if (p.test(sentence)) score += 4;
  }

  // Contrarian / surprising insight
  const contrarianPatterns = [
    /counter.?intuitive/i, /people think.*but/i, /not about/i,
    /instead of/i, /rather than/i, /paradox/i, /surprising/i,
    /the opposite/i, /common mistake/i, /most people.*wrong/i,
  ];
  for (const p of contrarianPatterns) {
    if (p.test(sentence)) score += 3;
  }

  // Actionable / prescriptive
  const actionPatterns = [
    /^(If you|When you|Don't|Start with|Stop|Focus on|Think about|Ask yourself|The way to)/i,
    /you (should|need to|have to|must|want to) /i,
    /I (would|recommend|suggest|encourage|advise)/i,
  ];
  for (const p of actionPatterns) {
    if (p.test(sentence)) score += 3;
  }

  // Standalone quality: starts well (not mid-thought)
  if (/^(The |Every |People |If |When |What |One |Your |A |This is |It's |There's a )/i.test(sentence)) {
    score += 2;
  }

  // Penalize sentences that start mid-thought or are conversational fragments
  if (/^(And |But |Or |Because |Which |That |So |Also |Then )/i.test(sentence)) {
    score -= 2;
  }

  // Penalize filler
  if (/\[inaudible/i.test(sentence)) score -= 5;
  if (/blah,?\s*blah/i.test(sentence)) score -= 5;
  if (/I don'?t (really )?know/i.test(sentence)) score -= 3;
  if (/you know what I mean/i.test(sentence)) score -= 3;
  if (/et cetera/i.test(sentence)) score -= 1;

  // Penalize meta-conversation
  if (/great to be here|thank you|thanks for having|excited to be|good question/i.test(sentence)) {
    score -= 15;
  }

  // Penalize overly self-referential or story-like without payoff
  if (/I remember when|let me tell you|funny story/i.test(sentence) && len < 100) {
    score -= 2;
  }

  // Penalize quotes that are clearly incomplete or trailing off
  if (/\.\.\.$/.test(sentence) || /,$/.test(sentence)) score -= 3;

  // Penalize technical explanations that aren't insights (teaching mode vs. advice mode)
  if (/token|pre-training|fine-tuning|gradient|weight|parameter|neural network/i.test(sentence) &&
      !/should|need to|important|mistake|key|best/i.test(sentence)) {
    score -= 2;
  }

  // Penalize sentences that reference specific people/stories without standalone value
  if (/he said|she said|they said|I asked|I was like|he was like|she was like/i.test(sentence) &&
      !/should|need to|the key|the most|important/i.test(sentence)) {
    score -= 2;
  }

  // Boost sentences that make a clear point without needing context
  if (/^(The |Every |People |Your |A good |A great |The best |The worst |The most |One of )/i.test(sentence) &&
      len >= 60 && len <= 250) {
    score += 3;
  }

  return score;
}

function computeWordOverlap(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  return intersection / Math.min(wordsA.size, wordsB.size);
}

function pickTakeaways(guestStatements, n = 5) {
  const scored = [];

  for (const block of guestStatements) {
    const sentences = splitSentences(block.text);
    for (const s of sentences) {
      const cleaned = cleanForTakeaway(s);
      if (cleaned.length < 40 || cleaned.length > 500) continue;
      // Re-score the cleaned version
      scored.push({ text: cleaned, score: scoreSentence(cleaned) });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const picked = [];
  for (const candidate of scored) {
    if (picked.length >= n) break;
    const isDuplicate = picked.some(p => computeWordOverlap(p.text, candidate.text) > 0.5);
    if (!isDuplicate) {
      picked.push(candidate);
    }
  }

  return picked.map(p => p.text);
}

// ── Summary Generation ───────────────────────────────────────────────────────

/**
 * Extract key topic words from a title string (removing guest name, punctuation, etc.)
 */
function extractTopicFromTitle(title, guestName) {
  let topic = title;
  // Remove guest name
  const namePattern = new RegExp(guestName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  topic = topic.replace(namePattern, '');
  // Remove common separators and leading/trailing junk
  topic = topic.replace(/^\s*[:|\-–—]\s*/, '').replace(/\s*\|.*$/, '').replace(/^\s*["']\s*/, '').replace(/\s*["']\s*$/, '').trim();
  return topic;
}

/**
 * Get the guest's display name for summaries (first name, or full if needed like "Dr. Becky")
 */
function getDisplayName(guestName) {
  if (/^Dr\.?\s/i.test(guestName)) {
    // Use "Dr. Becky" not just "Dr."
    const parts = guestName.split(/\s+/);
    return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : guestName;
  }
  return guestName.split(' ')[0];
}

/**
 * Extract the core point from a statement block -- get the most insightful
 * sentence from the block rather than the whole thing.
 */
function extractCoreSentence(block) {
  const sentences = splitSentences(block.text);
  if (sentences.length === 0) return '';

  // Score each and pick the best, but bias towards earlier sentences in the block
  let best = { text: sentences[0], score: -Infinity };
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    let score = scoreSentence(s);
    // Slight preference for earlier sentences (they tend to be the point, not elaboration)
    score += Math.max(0, 3 - i);
    if (score > best.score && s.length > 40 && s.length < 300) {
      best = { text: s, score };
    }
  }
  return cleanText(best.text);
}

/**
 * Find recurring themes/keywords across guest statements.
 */
function findKeyThemes(guestStatements) {
  const wordFreq = {};
  const stopWords = new Set([
    'the', 'and', 'that', 'this', 'with', 'from', 'have', 'been', 'will', 'would',
    'could', 'should', 'about', 'which', 'their', 'there', 'they', 'them', 'then',
    'than', 'what', 'when', 'where', 'your', 'just', 'like', 'also', 'very', 'really',
    'much', 'more', 'some', 'into', 'over', 'going', 'think', 'know', 'want', 'kind',
    'sort', 'thing', 'things', 'actually', 'basically', 'something', 'because', 'right',
    'people', 'even', 'being', 'doing', 'having', 'make', 'were', 'does', 'other',
    'able', 'back', 'time', 'said', 'saying', 'says', 'look', 'mean', 'well',
    'yeah', 'okay', 'sure', 'great', 'good', 'it\'s', 'don\'t', 'didn\'t', 'can\'t',
    'that\'s', 'you\'re', 'we\'re', 'i\'m', 'i\'ve', 'it\'s', 'lot', 'way', 'get',
  ]);

  for (const block of guestStatements) {
    const words = block.text.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    for (const w of words) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(e => e[0]);
}

function generateSummary(frontmatter, guestStatements, guestName) {
  const title = frontmatter.title || '';
  const description = frontmatter.description || '';
  const displayName = getDisplayName(guestName);
  const topicFromTitle = extractTopicFromTitle(title, guestName);

  // Filter to substantive statements (skip greetings, short stuff)
  const substantive = guestStatements.filter(s => {
    const lower = s.text.toLowerCase();
    return s.text.length > 80 &&
      !/^(great|awesome|thank|excited|happy|honored) to be here/i.test(lower) &&
      !/^thank you/i.test(lower) &&
      !/^thanks for having/i.test(lower) &&
      !/^hi,? lenny/i.test(lower);
  });

  if (substantive.length === 0) {
    return description || `${guestName} joins Lenny to discuss ${topicFromTitle || 'their expertise'}.`;
  }

  // Strategy: Build a 2-3 sentence summary that reads naturally.
  // Sentence 1: Guest's main thesis (from their first substantive point + title context)
  // Sentence 2: A key detail or framework they introduce
  // Sentence 3 (optional): A surprising or actionable point from deeper in the conversation

  // Get the core point from the first few substantive blocks
  const firstCore = extractCoreSentence(substantive[0]);
  const secondCore = substantive.length > 1 ? extractCoreSentence(substantive[1]) : '';
  const thirdCore = substantive.length > 2 ? extractCoreSentence(substantive[2]) : '';

  // Find the best insight from deeper in the conversation (blocks 5-30)
  const deepStatements = substantive.slice(4, Math.min(30, substantive.length));
  let bestDeepInsight = '';
  let bestDeepScore = -Infinity;
  for (const block of deepStatements) {
    const sentences = splitSentences(block.text);
    for (const s of sentences) {
      const cleaned = cleanText(s);
      const score = scoreSentence(cleaned);
      if (score > bestDeepScore && cleaned.length > 70 && cleaned.length < 280) {
        // Must be a standalone-quality sentence
        if (/^(The |Every |People |If |When |What |One |Your |A |This is )/i.test(cleaned)) {
          // Additional quality check: must contain a verb and not be a setup/transition
          const hasInsightSignal = /\b(should|need|must|important|mistake|key|best|worst|always|never|every|problem|solution|difference|way to|how to|secret|trick)\b/i.test(cleaned);
          if (hasInsightSignal) {
            bestDeepScore = score;
            bestDeepInsight = cleaned;
          }
        }
      }
    }
  }

  // Build the summary
  let summary = '';

  // Helper to check if a sentence has too much first-person language
  function hasTooMuchFirstPerson(s) {
    const count = (s.match(/\b(I|my|me|I'm|I've|I'd|I'll)\b/gi) || []).length;
    const words = s.split(/\s+/).length;
    return count / words > 0.12;
  }

  // First sentence: Main thesis
  if (firstCore) {
    let firstCleaned = toThirdPerson(firstCore, displayName);
    // If still too first-person, try the second or third core instead
    if (hasTooMuchFirstPerson(firstCleaned) && secondCore) {
      firstCleaned = toThirdPerson(secondCore, displayName);
    }
    const firstLower = lowercaseStart(firstCleaned);
    const connector1 = chooseSummaryConnector(firstLower, displayName, 'first');
    summary = `${displayName} ${connector1} ${firstLower}`;
    if (!/[.!?]$/.test(summary)) summary += '.';
  }

  // Second sentence: supporting detail
  const secondInsight = secondCore || thirdCore;
  if (secondInsight) {
    let secondCleaned = toThirdPerson(secondInsight, displayName);
    // If too first-person, try thirdCore as fallback
    if (hasTooMuchFirstPerson(secondCleaned) && thirdCore && secondInsight !== thirdCore) {
      secondCleaned = toThirdPerson(thirdCore, displayName);
    }
    if (!hasTooMuchFirstPerson(secondCleaned)) {
      const secondLower = lowercaseStart(secondCleaned);
      const connector2 = chooseSummaryConnector(secondLower, displayName, 'second');
      summary += ` ${displayName} ${connector2} ${secondLower}`;
      if (!/[.!?]$/.test(summary)) summary += '.';
    }
  }

  // Third sentence (optional): best deep insight if it adds something different
  if (bestDeepInsight && bestDeepScore > 5) {
    const overlapWithExisting = computeWordOverlap(bestDeepInsight, summary);
    if (overlapWithExisting < 0.35) {
      const deepCleaned = toThirdPerson(bestDeepInsight, displayName);
      // Skip if the cleaned version still has too much first-person
      const firstPersonCount = (deepCleaned.match(/\b(I|my|me|I'm|I've|I'd)\b/gi) || []).length;
      const wordCount = deepCleaned.split(/\s+/).length;
      if (firstPersonCount / wordCount < 0.1) {
        const deepLower = lowercaseStart(deepCleaned);
        const connector3 = chooseSummaryConnector(deepLower, displayName, 'third');
        summary += ` ${displayName} ${connector3} ${deepLower}`;
        if (!/[.!?]$/.test(summary)) summary += '.';
      }
    }
  }

  // Final cleanup
  summary = summary
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/,\./g, '.')
    .trim();

  // Cap summary length -- if it's too long, trim to ~2 sentences
  const sentenceBreaks = [...summary.matchAll(/[.!?]\s+/g)];
  if (summary.length > 600 && sentenceBreaks.length >= 2) {
    const cutPoint = sentenceBreaks[1].index + 1;
    summary = summary.slice(0, cutPoint).trim();
  }

  return summary;
}

/**
 * Choose a natural-sounding connector phrase based on the sentence content.
 * e.g., "argues that" works before a claim, "breaks down how" works before an explanation.
 */
function chooseSummaryConnector(sentenceLower, displayName, position) {
  // If the sentence starts with a noun/concrete claim, use "argues that"
  // If it starts with a process/how description, use "breaks down how"
  // If it starts with a conditional, use "explains that"

  if (position === 'first') {
    if (/^(the |every |people |we |there |all |this )/i.test(sentenceLower)) {
      return 'argues that';
    }
    if (/^(if |when |once |in order)/i.test(sentenceLower)) {
      return 'explains that';
    }
    if (/^(what|how|why)/i.test(sentenceLower)) {
      return 'breaks down';
    }
    return 'argues that';
  }

  if (position === 'second') {
    if (/^(the |every |people |a |an |one )/i.test(sentenceLower)) {
      return 'also points out that';
    }
    if (/^(if |when |once )/i.test(sentenceLower)) {
      return 'goes on to explain that';
    }
    return 'also explains that';
  }

  // third position
  if (/^(the |every |people )/i.test(sentenceLower)) {
    return 'emphasizes that';
  }
  return 'also stresses that';
}

function lowercaseStart(s) {
  if (!s) return s;
  // Don't lowercase: AI, acronyms, proper sentences starting with I, names, etc.
  if (/^(AI |I |I'|[A-Z]{2,}|[A-Z][a-z]+ [A-Z])/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function processFile(filepath) {
  const raw = fs.readFileSync(filepath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const guestField = frontmatter.guest || '';
  const guestNames = guestField.split(/\s*\+\s*/).map(n => n.trim());
  const cleanGuestNames = guestNames.map(n => n.replace(/\s+\d+(\.\d+)?$/, '').trim());

  const blocks = parseTranscript(content);
  const guestStatements = getGuestStatements(blocks, cleanGuestNames);

  if (guestStatements.length === 0) {
    console.warn(`  Warning: No guest statements found in ${path.basename(filepath)}`);
    return null;
  }

  const primaryGuestName = cleanGuestNames[0];
  const summary = generateSummary(frontmatter, guestStatements, primaryGuestName);
  const takeaways = pickTakeaways(guestStatements, 5);

  return { summary, takeaways };
}

function main() {
  const files = fs.readdirSync(PODCASTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} transcript files.\n`);

  const results = {};
  let successCount = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const filepath = path.join(PODCASTS_DIR, file);

    console.log(`Processing: ${slug}`);

    try {
      const result = processFile(filepath);
      if (result) {
        results[slug] = result;
        successCount++;
      }
    } catch (err) {
      console.error(`  Error processing ${file}: ${err.message}`);
    }
  }

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nDone! Processed ${successCount}/${files.length} files.`);
  console.log(`Output written to: ${OUTPUT_FILE}`);
}

main();
