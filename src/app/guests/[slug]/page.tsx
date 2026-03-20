import { getData } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

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

export async function generateStaticParams() {
  const data = getData();
  return data.guests.map((guest) => ({ slug: guest.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getData();
  const guest = data.guests.find((g) => g.slug === slug);
  if (!guest) return { title: "Not Found" };

  return {
    title: `${guest.name} | Lenny's Wisdom Engine`,
    description: guest.description,
    openGraph: {
      title: `${guest.name} on Lenny's Podcast`,
      description: guest.topQuotes[0]?.text?.slice(0, 200) || guest.description,
    },
  };
}

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getData();
  const guest = data.guests.find((g) => g.slug === slug);
  if (!guest) notFound();

  const guestQuotes = data.quotes.filter((q) => q.guestSlug === slug);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/guests"
        className="text-sm text-muted hover:text-accent transition-colors mb-6 inline-block"
      >
        &larr; All Guests
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold shrink-0">
          {guest.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{guest.name}</h1>
          <p className="text-muted mt-1">{guest.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
            <span>
              {new Date(guest.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>&middot;</span>
            <span>{guest.wordCount.toLocaleString()} words</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {guest.themes.map((theme) => (
              <span
                key={theme}
                className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                  THEME_COLORS[theme] || "bg-accent/10 text-accent border-accent/20"
                }`}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Episode Title */}
      <div className="bg-surface rounded-xl p-5 border border-surface-light mb-8">
        <h2 className="text-sm font-medium text-muted mb-1">Episode</h2>
        <p className="text-foreground font-medium">{guest.title}</p>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-3">Summary</h2>
        <p className="text-muted leading-relaxed">{guest.summary}</p>
      </div>

      {/* Key Takeaways */}
      {guest.takeaways && guest.takeaways.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Key Takeaways</h2>
          <div className="space-y-3">
            {guest.takeaways.map((takeaway: string, i: number) => (
              <div
                key={i}
                className="flex gap-4 items-start bg-surface rounded-xl p-4 border border-surface-light"
              >
                <span className="text-accent font-bold text-lg shrink-0 w-6 text-center">
                  {i + 1}
                </span>
                <p className="text-foreground leading-relaxed">{takeaway}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotes */}
      <h2 className="text-xl font-bold text-foreground mb-4">
        Notable Quotes
        <span className="text-sm font-normal text-muted ml-2">
          {guestQuotes.length} extracted insights
        </span>
      </h2>
      <div className="space-y-4">
        {guestQuotes.map((quote, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-5 border border-surface-light"
          >
            <p className="text-foreground leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1">
                {quote.themes.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent border border-accent/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted font-mono">{quote.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
