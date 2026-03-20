"use client";

import { useState } from "react";
import { Theme } from "@/lib/data";

const THEME_COLORS: Record<string, string> = {
  "AI & Machine Learning": "#7c3aed",
  "Growth & Metrics": "#10b981",
  "Leadership & Management": "#f59e0b",
  "Product Strategy": "#3b82f6",
  "Startup Building": "#ef4444",
  "Design & UX": "#ec4899",
  "Engineering": "#06b6d4",
  "Pricing & Monetization": "#f97316",
  "Sales & GTM": "#8b5cf6",
  "Career & Personal Growth": "#14b8a6",
  "User Psychology": "#e879f9",
  "Data & Analytics": "#6366f1",
};

export default function TopicBubbles({
  themes,
  onThemeClick,
}: {
  themes: Theme[];
  onThemeClick: (theme: string) => void;
}) {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const maxCount = Math.max(...themes.map((t) => t.count));

  return (
    <div className="w-full flex flex-wrap justify-center gap-4 py-6">
      {themes.map((theme) => {
        const color = THEME_COLORS[theme.name] || "#5b8fb9";
        const isHovered = hoveredBubble === theme.name;
        // Scale size based on episode count
        const scale = 0.7 + (theme.count / maxCount) * 0.3;
        const size = Math.round(130 * scale);

        return (
          <button
            key={theme.name}
            onClick={() => onThemeClick(theme.name)}
            onMouseEnter={() => setHoveredBubble(theme.name)}
            onMouseLeave={() => setHoveredBubble(null)}
            className="rounded-full flex flex-col items-center justify-center transition-all duration-200 shrink-0"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 40% 35%, ${color}30, ${color}10)`,
              border: `1.5px solid ${color}${isHovered ? "aa" : "55"}`,
              boxShadow: isHovered
                ? `0 0 24px ${color}40, inset 0 0 20px ${color}15`
                : `0 0 12px ${color}15`,
              transform: isHovered ? "scale(1.08)" : "scale(1)",
            }}
          >
            <span
              className="text-xs font-semibold text-center leading-tight px-2"
              style={{ color: isHovered ? "#ffffff" : "#c8d1e0" }}
            >
              {theme.name}
            </span>
            <span
              className="text-[10px] font-medium mt-1"
              style={{ color: color + "cc" }}
            >
              {theme.count} episodes
            </span>
          </button>
        );
      })}
    </div>
  );
}
