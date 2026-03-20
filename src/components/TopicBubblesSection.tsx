"use client";

import { useState } from "react";
import TopicBubbles from "./TopicBubbles";
import { Theme, Quote } from "@/lib/data";
import Link from "next/link";

export default function TopicBubblesSection({
  themes,
  quotes,
}: {
  themes: Theme[];
  quotes: Quote[];
}) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const filteredQuotes = selectedTheme
    ? quotes.filter((q) => q.themes.includes(selectedTheme))
    : [];

  return (
    <div>
      <div className="bg-surface rounded-2xl border border-surface-light overflow-hidden">
        <TopicBubbles themes={themes} onThemeClick={setSelectedTheme} />
      </div>

      {selectedTheme && (
        <div className="mt-6 bg-surface rounded-2xl p-6 border border-surface-light">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedTheme}
              <span className="text-sm text-muted font-normal ml-2">
                {filteredQuotes.length} quotes
              </span>
            </h3>
            <button
              onClick={() => setSelectedTheme(null)}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredQuotes.slice(0, 8).map((q, i) => (
              <Link
                key={i}
                href={`/guests/${q.guestSlug}`}
                className="block p-4 rounded-lg bg-background hover:bg-surface-light transition-colors border border-surface-light"
              >
                <p className="text-sm text-foreground leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </p>
                <p className="text-xs text-accent mt-2 font-medium">
                  {q.speaker}
                  <span className="text-muted font-normal">
                    {" "}&middot; {q.episodeTitle}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
