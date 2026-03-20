const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DATA_DIR = path.resolve(__dirname, '../../lennys-newsletterpodcastdata');
const OUTPUT_FILE = path.resolve(__dirname, '../public/data.json');

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
    // Match speaker lines like **Brian Halligan** (00:00:00):
    const speakerMatch = line.match(/^\*\*(.+?)\*\*\s*\((\d{2}:\d{2}:\d{2})\):/);
    if (speakerMatch) {
      // Save previous quote if it's from the guest (not Lenny)
      if (currentSpeaker && !currentSpeaker.toLowerCase().includes('lenny') && currentText.trim()) {
        const text = currentText.trim();
        const wordCount = text.split(/\s+/).length;
        if (wordCount >= 15 && wordCount <= 200) {
          // Filter out filler
          const lower = text.toLowerCase();
          if (!lower.startsWith('yeah') && !lower.startsWith('thank') && !lower.startsWith('exactly') && !lower.startsWith('right') && !lower.startsWith('sure') && lower.length > 80) {
            quotes.push({
              text,
              speaker: currentSpeaker,
              timestamp: currentTimestamp,
              wordCount
            });
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

  // Don't forget the last quote
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

function selectBestQuotes(quotes, maxPerGuest = 5) {
  // Score quotes by: length (prefer medium), uniqueness of content, theme coverage
  const scored = quotes.map(q => {
    let score = 0;
    // Prefer quotes between 25-80 words
    if (q.wordCount >= 25 && q.wordCount <= 80) score += 3;
    else if (q.wordCount >= 20 && q.wordCount <= 100) score += 2;
    else score += 1;
    // Bonus for questions/statements that feel insightful
    if (q.text.includes('because') || q.text.includes('the key') || q.text.includes('most important') || q.text.includes('lesson') || q.text.includes('mistake') || q.text.includes('secret')) score += 2;
    // Bonus for actionable language
    if (q.text.includes('you should') || q.text.includes('I learned') || q.text.includes('framework') || q.text.includes('principle') || q.text.includes('advice')) score += 2;
    return { ...q, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxPerGuest);
}

function processNewsletter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  // Extract key paragraphs (skip images, links lists, headers)
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

  // Process podcasts
  for (const podcast of index.podcasts) {
    const filePath = path.join(DATA_DIR, podcast.filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const quotes = extractQuotes(content, frontmatter.guest);
    const bestQuotes = selectBestQuotes(quotes);
    const contentThemes = classifyThemes(content);

    // Count themes
    for (const theme of contentThemes) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }

    const slug = path.basename(podcast.filename, '.md');

    const guest = {
      name: frontmatter.guest || podcast.guest,
      slug,
      title: frontmatter.title || podcast.title,
      description: frontmatter.description || podcast.description,
      date: frontmatter.date || podcast.date,
      wordCount: podcast.word_count,
      themes: contentThemes,
      topQuotes: bestQuotes.map(q => ({
        text: q.text,
        timestamp: q.timestamp
      }))
    };

    guests.push(guest);

    // Add to global quotes pool
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

  // Build theme data for visualization
  const themes = Object.entries(themeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Build search index data (Fuse.js will index client-side)
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
  console.log('Themes:', themes.map(t => `${t.name} (${t.count})`).join(', '));
  console.log('Total words analyzed:', data.stats.totalWords.toLocaleString());
}

main();
