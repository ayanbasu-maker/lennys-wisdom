import { getData } from "@/lib/data";
import TopicBubblesSection from "@/components/TopicBubblesSection";
import WisdomGenerator from "@/components/WisdomGenerator";



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

      {/* Wisdom Generator */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Random Wisdom</h2>
        <p className="text-sm text-muted mb-6">
          Get a random insight from 50 episodes — share the ones that resonate
        </p>
        <WisdomGenerator quotes={data.quotes} />
      </section>

      {/* Topic Bubbles */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">Topic Landscape</h2>
        <p className="text-sm text-muted mb-6">
          Click any topic to see key themes, takeaways, and notable quotes
        </p>
        <TopicBubblesSection themes={data.themes} quotes={data.quotes} guests={data.guests} />
      </section>

    </div>
  );
}
