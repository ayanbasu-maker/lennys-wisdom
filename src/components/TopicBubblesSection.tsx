"use client";

import { useState } from "react";
import TopicBubbles from "./TopicBubbles";
import { Theme, Quote } from "@/lib/data";
import Link from "next/link";

const THEME_SUMMARIES: Record<
  string,
  { summary: string; takeaways: string[] }
> = {
  "AI & Machine Learning": {
    summary:
      "Guests consistently emphasize that AI is reshaping every product role — not replacing PMs, but demanding they understand what's possible. The biggest shift is from building features to curating intelligent experiences. Companies winning with AI treat it as a core capability, not a feature checkbox.",
    takeaways: [
      "Start by deeply understanding your users' workflows before applying AI — the best AI products remove friction, not add complexity",
      "Prototype with AI tools yourself before speccing anything — hands-on experience changes how you think about what's buildable",
      "The moat in AI products is rarely the model — it's the proprietary data, user trust, and feedback loops you build around it",
      "Evaluate AI features by measuring task completion and user satisfaction, not just model accuracy",
    ],
  },
  "Growth & Metrics": {
    summary:
      "The most successful growth leaders focus obsessively on retention before acquisition. Guests repeatedly stress that sustainable growth comes from making existing users happier, not just acquiring more. North star metrics should reflect value delivered, not vanity engagement.",
    takeaways: [
      "Fix retention before investing in acquisition — a leaky bucket makes every growth dollar less efficient",
      "Pick one north star metric that directly reflects the value users get from your product",
      "Growth is a system, not a hack — build compounding loops (content → SEO → users → more content)",
      "Segment your users early — power users, casual users, and churned users need fundamentally different strategies",
    ],
  },
  "Leadership & Management": {
    summary:
      "Great product leaders create clarity, not control. Guests highlight that the best managers shield their teams from noise, set ambitious but clear goals, and give people room to own decisions. The transition from IC to manager is the hardest career shift in tech.",
    takeaways: [
      "Your job as a leader is to create context, not make every decision — share the 'why' and let your team figure out the 'how'",
      "Have direct, caring conversations early — most management failures come from avoiding hard feedback",
      "Hire for slope over intercept — a fast learner with the right attitude beats an experienced person who's plateaued",
      "Build a culture of writing — written proposals force clarity and create institutional memory",
    ],
  },
  "Product Strategy": {
    summary:
      "Strategy is about making hard choices, not listing priorities. Guests consistently argue that the best product strategies say 'no' to good ideas to focus on great ones. Product-market fit isn't binary — it's a spectrum that requires continuous re-validation.",
    takeaways: [
      "A strategy is only real if it explicitly says what you're NOT doing — if everything is a priority, nothing is",
      "Talk to users weekly, not quarterly — the best product instincts come from constant customer exposure",
      "Product-market fit feels like pull, not push — if you're constantly convincing users, you haven't found it yet",
      "Write a one-page strategy doc every quarter — if you can't explain it simply, you don't understand it well enough",
    ],
  },
  "Startup Building": {
    summary:
      "Founders who succeed move fast on learning, not just shipping. Guests emphasize that early-stage is about finding one thing that works, not building a complete product. The biggest mistake is scaling before you truly understand what's working and why.",
    takeaways: [
      "Do things that don't scale first — manual processes reveal what your users actually need before you automate",
      "Find your first 10 customers who genuinely love your product before trying to reach 1,000",
      "Speed of iteration is your only real advantage over incumbents — ship weekly, learn daily",
      "Fundraising follows traction — build something people want, and investors come to you",
    ],
  },
  "Design & UX": {
    summary:
      "The best products feel invisible. Guests stress that great design is about removing steps, not adding polish. User research should be fast and frequent, not a quarterly ceremony. The most impactful design decisions often look like simplification.",
    takeaways: [
      "Remove one step from your user flow every sprint — the fastest path to value wins",
      "Watch 5 users use your product before every major launch — you'll catch 80% of problems",
      "Design for the user's job-to-be-done, not their feature requests — they describe solutions, you need to find the real problem",
      "Consistency beats novelty — users prefer familiar patterns over clever new interactions",
    ],
  },
  Engineering: {
    summary:
      "The best engineering cultures ship fast and learn faster. Guests highlight that technical excellence means choosing the right trade-offs, not building the perfect system. The strongest eng teams are deeply connected to users and business outcomes.",
    takeaways: [
      "Invest in developer experience early — fast CI/CD and easy deploys compound into massive velocity gains",
      "Technical debt is a business decision, not just an engineering one — frame it in terms of shipped features per week",
      "The best engineers think like product managers — they understand the 'why' behind what they're building",
      "Ship incremental improvements over big rewrites — rewrites almost always take 3x longer than estimated",
    ],
  },
  "Pricing & Monetization": {
    summary:
      "Pricing is the most under-invested lever in most startups. Guests consistently argue that most companies under-price and wait too long to charge. The right pricing strategy aligns what you charge with the value users receive.",
    takeaways: [
      "Charge earlier than you think — free users give worse feedback than paying customers",
      "Price on value delivered, not cost to serve — if your product saves users $10K/month, charging $500 is a steal",
      "Run pricing experiments continuously — a 10% price increase with no churn drops straight to the bottom line",
      "Offer 3 tiers: a free/cheap entry point, a core plan for most users, and a premium plan that anchors high value",
    ],
  },
  "Sales & GTM": {
    summary:
      "The best go-to-market motions start with a wedge, not the whole platform. Guests stress that product-led growth and sales-led growth aren't opposites — the best companies layer sales on top of product adoption. Enterprise deals are won by solving a specific pain point first.",
    takeaways: [
      "Land with one use case, then expand — trying to sell the whole platform upfront overwhelms buyers",
      "Build sales on top of product usage — your best enterprise leads are already using your free tier",
      "Customer success drives expansion revenue more than net-new sales — invest in making existing customers wildly successful",
      "The best sales reps are product experts who genuinely help customers, not just closers",
    ],
  },
  "Career & Personal Growth": {
    summary:
      "Career growth comes from taking uncomfortable bets and building a track record of impact. Guests advise optimizing for learning in your first roles, then leveraging that expertise into bigger opportunities. Your network and reputation compound over time.",
    takeaways: [
      "Join a rocket ship early in your career — growth companies create more opportunities than stable ones",
      "Build in public — writing, speaking, and sharing your work creates opportunities you can't predict",
      "The best career moves feel risky at the time — lean into the roles that scare you a little",
      "Find a mentor who's 2-3 steps ahead, not 20 — their advice will be more relevant and actionable",
    ],
  },
  "User Psychology": {
    summary:
      "Products that stick tap into core human motivations: progress, belonging, and mastery. Guests highlight that the best engagement loops create genuine value, not just dopamine hits. Understanding why users behave the way they do is the foundation of every great product.",
    takeaways: [
      "Design for habits, not just features — trigger → action → reward → investment is the core loop",
      "Social proof is your most powerful conversion tool — show users what people like them are doing",
      "Reduce cognitive load at every step — confused users don't convert, they leave",
      "The best onboarding gets users to their 'aha moment' in under 60 seconds",
    ],
  },
  "Data & Analytics": {
    summary:
      "Data-informed beats data-driven. Guests warn against letting metrics replace judgment — the best teams use data to challenge assumptions, not to avoid making decisions. Experimentation culture matters more than any single A/B test.",
    takeaways: [
      "Instrument everything from day one — you can't learn from data you didn't collect",
      "Run experiments to learn, not just to validate — the most valuable tests are the ones that surprise you",
      "Dashboards should answer 'so what?' not just 'what happened' — tie every metric to a decision",
      "Beware vanity metrics — total signups mean nothing if weekly active usage is declining",
    ],
  },
};

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

  const themeSummary = selectedTheme ? THEME_SUMMARIES[selectedTheme] : null;

  return (
    <div>
      <div className="bg-surface rounded-2xl border border-surface-light overflow-hidden">
        <TopicBubbles themes={themes} onThemeClick={setSelectedTheme} />
      </div>

      {selectedTheme && themeSummary && (
        <div className="mt-6 bg-surface rounded-2xl p-6 border border-surface-light">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-foreground">
              {selectedTheme}
            </h3>
            <button
              onClick={() => setSelectedTheme(null)}
              className="text-sm text-muted hover:text-foreground transition-colors px-3 py-1 rounded-lg hover:bg-surface-light"
            >
              Close
            </button>
          </div>

          {/* Summary */}
          <p className="text-sm text-muted leading-relaxed mb-6">
            {themeSummary.summary}
          </p>

          {/* Key Takeaways */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
              Key Takeaways
            </h4>
            <div className="space-y-3">
              {themeSummary.takeaways.map((takeaway, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-accent font-bold text-sm mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {takeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-surface-light my-6" />

          {/* Quotes */}
          <div>
            <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
              Notable Quotes
              <span className="text-muted font-normal normal-case ml-2">
                {filteredQuotes.length} quotes
              </span>
            </h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
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
                      {" "}
                      &middot; {q.episodeTitle}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
