import { getData } from "@/lib/data";
import TopicBubblesSection from "@/components/TopicBubblesSection";
import WisdomGenerator from "@/components/WisdomGenerator";
import GuestCard from "@/components/GuestCard";
import Link from "next/link";

export default function Home() {
  const data = getData();

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-16 pb-12 text-center">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
          50 episodes &middot; 830,000+ words &middot; 12 themes
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
          Lenny&apos;s Wisdom Engine
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Explore the most powerful insights from 50 episodes of{" "}
          <span className="text-foreground">Lenny&apos;s Podcast</span> — featuring
          Marc Andreessen, Stewart Butterfield, Melanie Perkins, and 47 more
          product leaders.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
          {[
            { value: data.stats.totalEpisodes, label: "Episodes" },
            { value: `${Math.round(data.stats.totalWords / 1000)}K`, label: "Words Analyzed" },
            { value: data.stats.totalQuotes, label: "Key Quotes" },
            { value: data.themes.length, label: "Themes" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface rounded-xl p-4 border border-surface-light">
              <div className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Topic Bubbles */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Topic Landscape</h2>
        <p className="text-sm text-muted mb-6">
          Click any topic to see key themes, takeaways, and notable quotes
        </p>
        <TopicBubblesSection themes={data.themes} quotes={data.quotes} guests={data.guests} />
      </section>

      {/* Wisdom Generator */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Random Wisdom</h2>
        <p className="text-sm text-muted mb-6">
          Get a random insight from 50 episodes — share the ones that resonate
        </p>
        <WisdomGenerator quotes={data.quotes} />
      </section>

      {/* Newsletter Highlights */}
      <section className="py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">Newsletter Highlights</h2>
          <p className="text-sm text-muted">
            {data.newsletters.length} deep-dive essays on product, AI, and career growth
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.newsletters.map((nl) => {
            const bestExcerpt = nl.excerpts.find(
              (e) => e.wordCount > 30 && !e.text.includes("Lenny") && !e.text.includes("follow") && !e.text.includes("Spotify")
            );
            return (
              <div
                key={nl.slug}
                className="bg-surface rounded-xl p-5 border border-surface-light hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
                    Newsletter
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(nl.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-foreground font-semibold mb-1 leading-snug">
                  {nl.title}
                </h3>
                {nl.subtitle && (
                  <p className="text-sm text-accent/80 mb-3">{nl.subtitle}</p>
                )}
                {bestExcerpt && (
                  <p className="text-xs text-muted leading-relaxed line-clamp-3">
                    {bestExcerpt.text}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {nl.themes.slice(0, 3).map((theme) => (
                    <span
                      key={theme}
                      className="px-2 py-0.5 text-[10px] rounded-full bg-surface-light text-muted"
                    >
                      {theme}
                    </span>
                  ))}
                  {nl.themes.length > 3 && (
                    <span className="text-[10px] text-muted">
                      +{nl.themes.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Guests */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Featured Guests</h2>
            <p className="text-sm text-muted">
              50 product leaders sharing hard-won wisdom
            </p>
          </div>
          <Link
            href="/guests"
            className="px-4 py-2 text-sm font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.guests.slice(0, 6).map((guest) => (
            <GuestCard key={guest.slug} guest={guest} />
          ))}
        </div>
      </section>
    </div>
  );
}
