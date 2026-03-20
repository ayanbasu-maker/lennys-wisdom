import { getData } from "@/lib/data";
import SearchBar from "@/components/SearchBar";

export const metadata = {
  title: "Search | Lenny's Wisdom Engine",
  description: "Search 250+ quotes from 50 Lenny's Podcast episodes",
};

export default function SearchPage() {
  const data = getData();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Search Wisdom</h1>
      <p className="text-muted mb-8">
        Search across {data.stats.totalQuotes} quotes from {data.stats.totalEpisodes} episodes
      </p>
      <SearchBar items={data.searchItems} />

      {/* Suggested topics */}
      <div className="mt-12">
        <h2 className="text-sm font-medium text-muted mb-3">Popular topics</h2>
        <div className="flex flex-wrap gap-2">
          {["hiring", "pricing", "AI agents", "growth", "leadership", "startup", "product-market fit", "retention", "culture", "enterprise sales"].map(
            (topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 text-sm bg-surface border border-surface-light rounded-lg text-muted"
              >
                {topic}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
