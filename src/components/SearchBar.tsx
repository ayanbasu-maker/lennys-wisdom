"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { SearchItem } from "@/lib/data";

export default function SearchBar({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "text", weight: 0.5 },
          { name: "speaker", weight: 0.3 },
          { name: "themes", weight: 0.2 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [items]
  );

  const results = query.length >= 2 ? fuse.search(query).slice(0, 20) : [];

  return (
    <div>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 250+ quotes across 50 episodes... (e.g. hiring, pricing, AI, growth)"
          className="w-full pl-12 pr-4 py-4 bg-surface border border-surface-light rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 text-sm"
        />
      </div>

      {query.length >= 2 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          {results.map(({ item }) => (
            <Link
              key={item.id}
              href={`/guests/${item.guestSlug}`}
              className="block bg-surface rounded-xl p-5 border border-surface-light hover:border-accent/40 transition-all"
            >
              <p className="text-sm text-foreground leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <span className="font-medium text-accent">{item.speaker}</span>
                <span>&middot;</span>
                <span>{item.episodeTitle}</span>
              </div>
              {item.themes && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.themes.split(", ").slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent border border-accent/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
