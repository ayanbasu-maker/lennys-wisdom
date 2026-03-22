const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const DATA_DIR = path.resolve(__dirname, "../../lennys-newsletterpodcastdata");
const OUT_DIR = path.resolve(__dirname, "../notebooklm");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function cleanMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // convert links to plain text
    .replace(/\*\*\[?(.*?)\]?\*\*/g, "$1") // remove bold markers
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim();
}

// --- Podcasts ---
const podcastDir = path.join(DATA_DIR, "podcasts");
const podcastFiles = fs.readdirSync(podcastDir).filter((f) => f.endsWith(".md")).sort();

let podcastOutput = `LENNY'S PODCAST — 50 EPISODE TRANSCRIPTS\n`;
podcastOutput += `${"=".repeat(60)}\n\n`;
podcastOutput += `This document contains full transcripts from 50 episodes of Lenny's Podcast,\n`;
podcastOutput += `featuring conversations with top product leaders, founders, and operators.\n\n`;

for (const file of podcastFiles) {
  const raw = fs.readFileSync(path.join(podcastDir, file), "utf-8");
  const { data: fm, content } = matter(raw);
  podcastOutput += `${"=".repeat(60)}\n`;
  podcastOutput += `EPISODE: ${fm.title || file}\n`;
  if (fm.guest) podcastOutput += `GUEST: ${fm.guest}\n`;
  if (fm.date) podcastOutput += `DATE: ${fm.date}\n`;
  if (fm.description) podcastOutput += `DESCRIPTION: ${fm.description}\n`;
  podcastOutput += `${"=".repeat(60)}\n\n`;
  podcastOutput += cleanMarkdown(content);
  podcastOutput += `\n\n\n`;
}

fs.writeFileSync(path.join(OUT_DIR, "podcast-transcripts.txt"), podcastOutput);
console.log(`Podcasts: ${podcastFiles.length} episodes → notebooklm/podcast-transcripts.txt`);

// --- Newsletters ---
const nlDir = path.join(DATA_DIR, "newsletters");
const nlFiles = fs.readdirSync(nlDir).filter((f) => f.endsWith(".md")).sort();

let nlOutput = `LENNY'S NEWSLETTER — 10 DEEP-DIVE ESSAYS\n`;
nlOutput += `${"=".repeat(60)}\n\n`;
nlOutput += `This document contains 10 newsletter essays from Lenny Rachitsky\n`;
nlOutput += `covering product management, AI, growth, and career advice.\n\n`;

for (const file of nlFiles) {
  const raw = fs.readFileSync(path.join(nlDir, file), "utf-8");
  const { data: fm, content } = matter(raw);
  nlOutput += `${"=".repeat(60)}\n`;
  nlOutput += `TITLE: ${fm.title || file}\n`;
  if (fm.subtitle) nlOutput += `SUBTITLE: ${fm.subtitle}\n`;
  if (fm.date) nlOutput += `DATE: ${fm.date}\n`;
  nlOutput += `${"=".repeat(60)}\n\n`;
  nlOutput += cleanMarkdown(content);
  nlOutput += `\n\n\n`;
}

fs.writeFileSync(path.join(OUT_DIR, "newsletter-essays.txt"), nlOutput);
console.log(`Newsletters: ${nlFiles.length} essays → notebooklm/newsletter-essays.txt`);

// Summary
const podSize = fs.statSync(path.join(OUT_DIR, "podcast-transcripts.txt")).size;
const nlSize = fs.statSync(path.join(OUT_DIR, "newsletter-essays.txt")).size;
console.log(`\nPodcast file: ${(podSize / 1024 / 1024).toFixed(1)} MB`);
console.log(`Newsletter file: ${(nlSize / 1024).toFixed(0)} KB`);
console.log(`\nUpload both files to notebooklm.google.com to generate your podcast!`);
