const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DATA_DIR = path.resolve(__dirname, '../../lennys-newsletterpodcastdata');
const OUTPUT_FILE = path.resolve(__dirname, '../public/data.json');
const SUMMARIES_FILE = path.resolve(__dirname, 'summaries.json');

// Load hand-crafted summaries
const handCraftedSummaries = JSON.parse(fs.readFileSync(SUMMARIES_FILE, 'utf-8'));

// Theme keywords for classification
const THEME_KEYWORDS = {
  'AI & Machine Learning': ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'model', 'neural', 'deep learning', 'training data', 'inference', 'generative', 'chatgpt', 'claude', 'openai', 'anthropic', 'agents', 'agentic', 'vibe cod'],
  'Growth & Metrics': ['growth', 'retention', 'churn', 'conversion', 'funnel', 'acquisition', 'activation', 'engagement', 'dau', 'mau', 'arr', 'revenue', 'monetization', 'plg', 'product-led'],
  'Leadership & Management': ['leader', 'management', 'manager', 'ceo', 'cto', 'cpo', 'executive', 'coaching', 'mentor', 'culture', 'hiring', 'firing', 'team building', 'org structure', 'reorganiz'],
  'Product Strategy': ['strategy', 'roadmap', 'vision', 'mission', 'positioning', 'differentiation', 'competitive', 'market fit', 'product-market', 'pmf', 'moat', 'flywheel'],
  'Startup Building': ['startup', 'founder', 'founding', 'venture', 'fundrais', 'seed', 'series a', 'scale', 'pivot', 'bootstrap', 'zero to one', '0 to 1', 'early stage'],
  'Design & UX': ['design', 'ux', 'user experience', 'interface', 'prototype', 'usability', 'accessibility', 'user research', 'wireframe'],
  'Engineering': ['engineer', 'code', 'coding', 'technical debt', 'architecture', 'deploy', 'infrastructure', 'devops', 'api', 'sdk', 'developer experience', 'cursor', 'codex'],
  'Pricing & Monetization': ['pricing', 'price', 'monetiz', 'subscription', 'freemium', 'free trial', 'willingness to pay', 'arpu', 'ltv', 'unit economics'],
  'Sales & GTM': ['sales', 'go-to-market', 'gtm', 'enterprise', 'b2b', 'outbound', 'inbound', 'pipeline', 'quota', 'account executive', 'customer success'],
  'Career & Personal Growth': ['career', 'interview', 'resume', 'job', 'promotion', 'skill', 'learning', 'personal brand', 'networking', 'imposter syndrome', 'burnout', 'work-life'],
  'User Psychology': ['psychology', 'behavior', 'habit', 'motivation', 'gamification', 'notification', 'streak', 'dopamine', 'reward', 'engagement loop', 'emotion', 'trust'],
  'Data & Analytics': ['data', 'analytics', 'metric', 'experiment', 'a/b test', 'measurement', 'dashboard', 'insight', 'eval', 'benchmark']
};

function extractQuotes(content, guest) {
  const lines = content.split('\n');
  const quotes = [];
  let currentSpeaker = '';
  let currentText = '';
  let currentTimestamp = '';

  for (const line of lines) {
    const speakerMatch = line.match(/^\*\*(.+?)\*\*\s*\((\d{2}:\d{2}:\d{2})\):/);
    if (speakerMatch) {
      if (currentSpeaker && !currentSpeaker.toLowerCase().includes('lenny') && currentText.trim()) {
        const text = currentText.trim();
        const wordCount = text.split(/\s+/).length;
        if (wordCount >= 15 && wordCount <= 200) {
          const lower = text.toLowerCase();
          if (!lower.startsWith('yeah') && !lower.startsWith('thank') && !lower.startsWith('exactly') && !lower.startsWith('right') && !lower.startsWith('sure') && lower.length > 80) {
            quotes.push({ text, speaker: currentSpeaker, timestamp: currentTimestamp, wordCount });
          }
        }
      }
      currentSpeaker = speakerMatch[1];
      currentTimestamp = speakerMatch[2];
      currentText = line.replace(/^\*\*.+?\*\*\s*\(\d{2}:\d{2}:\d{2}\):/, '').trim();
    } else if (line.trim() && currentSpeaker) {
      currentText += ' ' + line.trim();
    }
  }

  if (currentSpeaker && !currentSpeaker.toLowerCase().includes('lenny') && currentText.trim()) {
    const text = currentText.trim();
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 15 && wordCount <= 200 && text.length > 80) {
      quotes.push({ text, speaker: currentSpeaker, timestamp: currentTimestamp, wordCount });
    }
  }

  return quotes;
}

function classifyThemes(text) {
  const lower = text.toLowerCase();
  const themes = [];
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        themes.push(theme);
        break;
      }
    }
  }
  return themes.length > 0 ? themes : ['General'];
}

// Extract Lenny's intro summary (he always summarizes the episode in the first few minutes)
function extractLennyIntro(content, guestName) {
  const lines = content.split('\n');
  let lennyBlocks = [];
  let currentSpeaker = '';
  let currentText = '';

  for (const line of lines) {
    const speakerMatch = line.match(/^\*\*(.+?)\*\*\s*\((\d{2}:\d{2}:\d{2})\):/);
    if (speakerMatch) {
      if (currentSpeaker && currentSpeaker.toLowerCase().includes('lenny') && currentText.trim()) {
        lennyBlocks.push(currentText.trim());
      }
      currentSpeaker = speakerMatch[1];
      currentText = line.replace(/^\*\*.+?\*\*\s*\(\d{2}:\d{2}:\d{2}\):/, '').trim();
    } else if (line.trim() && currentSpeaker) {
      currentText += ' ' + line.trim();
    }
  }

  // Find Lenny's intro block — usually the longest one in the first 10 blocks,
  // and it typically contains "my guest" or "we chat about" or "in this conversation"
  const introBlock = lennyBlocks.slice(0, 10).find(block => {
    const lower = block.toLowerCase();
    return (lower.includes('my guest') || lower.includes('we chat') || lower.includes('in this conversation') || lower.includes('in our conversation') || lower.includes('we discuss') || lower.includes('we dig into') || lower.includes('we talk about') || lower.includes('we explore')) && block.split(/\s+/).length > 40;
  });

  if (introBlock) {
    // Clean it up — remove "Today my guest is..." preamble and extract the substance
    let clean = introBlock
      .replace(/Today,?\s+my guest is.*?\.\s*/i, '')
      .replace(/In this (very special |)conversation,?\s*/i, 'They discuss ')
      .replace(/You are going to walk away.*$/i, '')
      .replace(/If you enjoy.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean.length > 500) clean = clean.slice(0, 497) + '...';
    return clean;
  }

  return null;
}

// Extract substantive takeaways from guest quotes
function extractSmartTakeaways(quotes) {
  const takeaways = [];

  // Score each quote for "takeaway-worthiness"
  const scored = quotes.map(q => {
    let score = 0;
    const lower = q.text.toLowerCase();

    // Strong indicators of insight
    if (lower.includes('the biggest') || lower.includes('the most important') || lower.includes('the key')) score += 3;
    if (lower.includes('what i learned') || lower.includes('what i\'ve learned') || lower.includes('lesson')) score += 3;
    if (lower.includes('mistake') || lower.includes('wrong')) score += 2;
    if (lower.includes('framework') || lower.includes('principle') || lower.includes('rule')) score += 3;
    if (lower.includes('advice') || lower.includes('recommend')) score += 2;
    if (lower.includes('the way i think about') || lower.includes('the way we think about')) score += 3;
    if (lower.includes('you should') || lower.includes('you need to') || lower.includes('you have to')) score += 2;
    if (lower.includes('because') && lower.includes('not')) score += 1; // Contrarian insights

    // Prefer medium-length quotes (25-80 words)
    if (q.wordCount >= 25 && q.wordCount <= 80) score += 2;
    else if (q.wordCount >= 20 && q.wordCount <= 100) score += 1;

    // Penalize very long rambling quotes
    if (q.wordCount > 120) score -= 2;

    return { ...q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top quotes and extract the most insightful sentence(s)
  for (const q of scored.slice(0, 10)) {
    const sentences = q.text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 30);

    for (const sentence of sentences) {
      let clean = sentence.trim();
      // Remove conversational starts
      clean = clean.replace(/^(And |So |But |Well,? |Yeah,? |Like,? |I mean,? )/i, '').trim();

      if (clean.length > 40 && clean.length < 250) {
        // Capitalize first letter
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) clean += '.';

        // Dedup check
        const isDuplicate = takeaways.some(existing => {
          const words1 = existing.toLowerCase().split(/\s+/);
          const words2 = clean.toLowerCase().split(/\s+/);
          const overlap = words1.filter(w => words2.includes(w)).length;
          return overlap > Math.min(words1.length, words2.length) * 0.5;
        });

        if (!isDuplicate) {
          takeaways.push(clean);
          if (takeaways.length >= 5) break;
        }
      }
    }
    if (takeaways.length >= 5) break;
  }

  return takeaways;
}

function selectBestQuotes(quotes, maxPerGuest = 5) {
  const scored = quotes.map(q => {
    let score = 0;
    if (q.wordCount >= 25 && q.wordCount <= 80) score += 3;
    else if (q.wordCount >= 20 && q.wordCount <= 100) score += 2;
    else score += 1;
    if (q.text.includes('because') || q.text.includes('the key') || q.text.includes('most important') || q.text.includes('lesson') || q.text.includes('mistake') || q.text.includes('secret')) score += 2;
    if (q.text.includes('you should') || q.text.includes('I learned') || q.text.includes('framework') || q.text.includes('principle') || q.text.includes('advice')) score += 2;
    return { ...q, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxPerGuest);
}

function processNewsletter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const paragraphs = content.split('\n\n')
    .map(p => p.trim())
    .filter(p => {
      if (!p) return false;
      if (p.startsWith('![')) return false;
      if (p.startsWith('*') && p.includes('Subscribe')) return false;
      if (p.startsWith('#')) return false;
      if (p.startsWith('1.') || p.startsWith('2.')) return false;
      const wordCount = p.split(/\s+/).length;
      return wordCount >= 20 && wordCount <= 200;
    })
    .slice(0, 5)
    .map(p => ({
      text: p.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*+/g, '').trim(),
      wordCount: p.split(/\s+/).length
    }));

  return {
    title: frontmatter.title,
    subtitle: frontmatter.subtitle || '',
    date: frontmatter.date,
    type: 'newsletter',
    slug: path.basename(filePath, '.md'),
    excerpts: paragraphs,
    themes: classifyThemes(content)
  };
}

function main() {
  const index = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'index.json'), 'utf-8'));

  const guests = [];
  const allQuotes = [];
  const themeCounts = {};

  let handCraftedCount = 0;
  let extractedCount = 0;

  for (const podcast of index.podcasts) {
    const filePath = path.join(DATA_DIR, podcast.filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const quotes = extractQuotes(content, frontmatter.guest);
    const bestQuotes = selectBestQuotes(quotes);
    const contentThemes = classifyThemes(content);

    for (const theme of contentThemes) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }

    const slug = path.basename(podcast.filename, '.md');
    const guestName = frontmatter.guest || podcast.guest;
    const guestDescription = frontmatter.description || podcast.description;

    // Use hand-crafted summary if available, otherwise extract from transcript
    let summary, takeaways;

    if (handCraftedSummaries[slug]) {
      summary = handCraftedSummaries[slug].summary;
      takeaways = handCraftedSummaries[slug].takeaways;
      handCraftedCount++;
    } else {
      // Extract Lenny's intro as summary
      const lennyIntro = extractLennyIntro(content, guestName);
      if (lennyIntro) {
        summary = lennyIntro;
      } else {
        summary = guestDescription;
      }
      // Extract smart takeaways from quotes
      takeaways = extractSmartTakeaways(quotes);
      extractedCount++;
    }

    const guest = {
      name: guestName,
      slug,
      title: frontmatter.title || podcast.title,
      description: guestDescription,
      date: frontmatter.date || podcast.date,
      wordCount: podcast.word_count,
      themes: contentThemes,
      summary,
      takeaways,
      topQuotes: bestQuotes.map(q => ({
        text: q.text,
        timestamp: q.timestamp
      }))
    };

    guests.push(guest);

    for (const q of bestQuotes) {
      allQuotes.push({
        text: q.text,
        speaker: q.speaker,
        guestSlug: slug,
        episodeTitle: guest.title,
        timestamp: q.timestamp,
        themes: classifyThemes(q.text)
      });
    }
  }

  // Process newsletters
  const newsletters = [];
  for (const nl of index.newsletters) {
    const filePath = path.join(DATA_DIR, nl.filename);
    newsletters.push(processNewsletter(filePath));
  }

  const themes = Object.entries(themeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const searchItems = allQuotes.map((q, i) => ({
    id: i,
    text: q.text,
    speaker: q.speaker,
    episodeTitle: q.episodeTitle,
    guestSlug: q.guestSlug,
    themes: q.themes.join(', ')
  }));

  const data = {
    guests,
    newsletters,
    themes,
    quotes: allQuotes,
    searchItems,
    stats: {
      totalEpisodes: guests.length,
      totalNewsletters: newsletters.length,
      totalQuotes: allQuotes.length,
      totalWords: guests.reduce((sum, g) => sum + g.wordCount, 0),
      totalGuests: guests.length
    }
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Built data.json with ${guests.length} guests, ${allQuotes.length} quotes, ${themes.length} themes, ${newsletters.length} newsletters`);
  console.log(`Summaries: ${handCraftedCount} hand-crafted, ${extractedCount} auto-extracted`);
  console.log('Themes:', themes.map(t => `${t.name} (${t.count})`).join(', '));
  console.log('Total words analyzed:', data.stats.totalWords.toLocaleString());
}

main();
