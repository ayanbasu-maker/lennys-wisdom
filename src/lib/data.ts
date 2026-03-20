import dataJson from "../../public/data.json";

export interface Quote {
  text: string;
  speaker: string;
  guestSlug: string;
  episodeTitle: string;
  timestamp: string;
  themes: string[];
}

export interface Guest {
  name: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  wordCount: number;
  themes: string[];
  summary: string;
  takeaways: string[];
  topQuotes: { text: string; timestamp: string }[];
}

export interface Newsletter {
  title: string;
  subtitle: string;
  date: string;
  type: string;
  slug: string;
  excerpts: { text: string; wordCount: number }[];
  themes: string[];
}

export interface Theme {
  name: string;
  count: number;
}

export interface Stats {
  totalEpisodes: number;
  totalNewsletters: number;
  totalQuotes: number;
  totalWords: number;
  totalGuests: number;
}

export interface SearchItem {
  id: number;
  text: string;
  speaker: string;
  episodeTitle: string;
  guestSlug: string;
  themes: string;
}

export interface AppData {
  guests: Guest[];
  newsletters: Newsletter[];
  themes: Theme[];
  quotes: Quote[];
  searchItems: SearchItem[];
  stats: Stats;
}

export function getData(): AppData {
  return dataJson as AppData;
}
