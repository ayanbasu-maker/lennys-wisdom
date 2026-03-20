import Link from "next/link";
import { Guest } from "@/lib/data";

const THEME_COLORS: Record<string, string> = {
  "AI & Machine Learning": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Growth & Metrics": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Leadership & Management": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Product Strategy": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Startup Building": "bg-red-500/10 text-red-400 border-red-500/20",
  "Design & UX": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Engineering": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Pricing & Monetization": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Sales & GTM": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Career & Personal Growth": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "User Psychology": "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  "Data & Analytics": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function GuestCard({ guest }: { guest: Guest }) {
  return (
    <Link href={`/guests/${guest.slug}`}>
      <div className="group bg-surface rounded-xl p-5 border border-surface-light hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/5 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm shrink-0 group-hover:bg-accent/30 transition-colors">
            {guest.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
              {guest.name}
            </h3>
            <p className="text-xs text-muted">
              {new Date(guest.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
              {" "}&middot;{" "}
              {Math.round(guest.wordCount / 1000)}k words
            </p>
          </div>
        </div>

        {guest.topQuotes[0] && (
          <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-3 flex-1">
            &ldquo;{guest.topQuotes[0].text.slice(0, 150)}
            {guest.topQuotes[0].text.length > 150 ? "..." : ""}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-auto">
          {guest.themes.slice(0, 2).map((theme) => (
            <span
              key={theme}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${
                THEME_COLORS[theme] || "bg-accent/10 text-accent border-accent/20"
              }`}
            >
              {theme.replace(" & Machine Learning", "/ML").replace(" & Metrics", "").replace(" & Management", "").replace(" & UX", "").replace(" & Monetization", "").replace(" & GTM", "").replace(" & Personal Growth", "").replace(" & Analytics", "")}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
