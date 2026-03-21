"use client";

import { useState } from "react";
import TopicBubbles from "./TopicBubbles";
import { Theme, Quote, Guest } from "@/lib/data";
import Link from "next/link";

const THEME_SUMMARIES: Record<
  string,
  { summary: string; takeaways: string[] }
> = {
  "AI & Machine Learning": {
    summary:
      "Guests consistently emphasize that AI is reshaping every product role — not replacing PMs, but demanding they understand what's possible. The biggest shift is from building features to curating intelligent experiences. Companies winning with AI treat it as a core capability, not a feature checkbox.",
    takeaways: [
      "Start by deeply understanding your users' workflows before applying AI — the best AI products remove friction, not add complexity. Map every step a user takes today, identify where they're stuck or slow, and only then ask 'could AI help here?'",
      "Prototype with AI tools yourself before speccing anything — hands-on experience changes how you think about what's buildable. PMs who haven't spent time with LLMs, image models, or agents will write specs that are either too conservative or impossible.",
      "The moat in AI products is rarely the model — it's the proprietary data, user trust, and feedback loops you build around it. Everyone has access to GPT-4 and Claude. What differentiates you is the data flywheel: users create data → model improves → users get more value → more users join.",
      "Evaluate AI features by measuring task completion and user satisfaction, not just model accuracy. A 95% accurate model that confuses users is worse than an 85% accurate model with clear confidence signals and graceful fallbacks.",
      "Build for the 'human-in-the-loop' — the best AI products augment human judgment rather than trying to fully automate. Let users review, edit, and override AI suggestions. This builds trust and creates the training data to improve over time.",
    ],
  },
  "Growth & Metrics": {
    summary:
      "The most successful growth leaders focus obsessively on retention before acquisition. Guests repeatedly stress that sustainable growth comes from making existing users happier, not just acquiring more. North star metrics should reflect value delivered, not vanity engagement.",
    takeaways: [
      "Fix retention before investing in acquisition — a leaky bucket makes every growth dollar less efficient. If your Day 30 retention is below 20%, no amount of top-of-funnel spend will build a sustainable business. Find out why users leave first.",
      "Pick one north star metric that directly reflects the value users get from your product. Slack chose 'messages sent in organizations with 2,000+'. Airbnb chose 'nights booked'. The right metric makes every team's priorities obvious.",
      "Growth is a system, not a hack — build compounding loops (content → SEO → users → more content). The best growth teams think in flywheels: each cohort of users makes the product more valuable for the next cohort.",
      "Segment your users early — power users, casual users, and churned users need fundamentally different strategies. A one-size-fits-all approach to activation, engagement, and resurrection will underperform targeted interventions by 3-5x.",
      "Run experiments on the activation flow first — getting users to their 'aha moment' faster has the highest ROI of any growth investment. Most products lose 60-80% of signups before they ever experience core value.",
    ],
  },
  "Leadership & Management": {
    summary:
      "Great product leaders create clarity, not control. Guests highlight that the best managers shield their teams from noise, set ambitious but clear goals, and give people room to own decisions. The transition from IC to manager is the hardest career shift in tech.",
    takeaways: [
      "Your job as a leader is to create context, not make every decision — share the 'why' and let your team figure out the 'how'. Teams with high context make better decisions locally than a leader could make centrally.",
      "Have direct, caring conversations early — most management failures come from avoiding hard feedback. The best managers give feedback within 48 hours while it's still actionable, framed around impact and growth, not judgment.",
      "Hire for slope over intercept — a fast learner with the right attitude beats an experienced person who's plateaued. Look for curiosity, self-awareness, and a bias toward action. Skills can be taught; drive can't.",
      "Build a culture of writing — written proposals force clarity and create institutional memory. Amazon's 6-page memo culture works because writing exposes fuzzy thinking. If someone can't write down their strategy, they don't understand it.",
      "Shield your team from organizational noise — context switching and unclear priorities kill velocity faster than any technical debt. Your job is to be the filter between company chaos and your team's focused execution.",
    ],
  },
  "Product Strategy": {
    summary:
      "Strategy is about making hard choices, not listing priorities. Guests consistently argue that the best product strategies say 'no' to good ideas to focus on great ones. Product-market fit isn't binary — it's a spectrum that requires continuous re-validation.",
    takeaways: [
      "A strategy is only real if it explicitly says what you're NOT doing — if everything is a priority, nothing is. The best strategists list their anti-goals alongside their goals to create alignment across the org.",
      "Talk to users weekly, not quarterly — the best product instincts come from constant customer exposure. Set up a system: 3 user calls per week, rotating across segments. Pattern recognition comes from volume, not one-off research studies.",
      "Product-market fit feels like pull, not push — if you're constantly convincing users, you haven't found it yet. When you have PMF, users tell other users. Support tickets shift from 'how do I do this?' to 'can you add more?'",
      "Write a one-page strategy doc every quarter — if you can't explain it simply, you don't understand it well enough. Share it with every team member. Revisit and revise openly when the market shifts.",
      "Sequence your bets: have one big bet (70% of resources), two medium bets (20%), and allow 10% for exploration. This avoids both the fragmentation of 'do everything' and the fragility of 'bet it all on one thing'.",
    ],
  },
  "Startup Building": {
    summary:
      "Founders who succeed move fast on learning, not just shipping. Guests emphasize that early-stage is about finding one thing that works, not building a complete product. The biggest mistake is scaling before you truly understand what's working and why.",
    takeaways: [
      "Do things that don't scale first — manual processes reveal what your users actually need before you automate. Stripe's founders installed their product for users in person. Airbnb's founders photographed listings themselves. These 'unscalable' actions revealed core insights.",
      "Find your first 10 customers who genuinely love your product before trying to reach 1,000. These early evangelists will tell you exactly what to build next, and they'll recruit your next 100 customers through word of mouth.",
      "Speed of iteration is your only real advantage over incumbents — ship weekly, learn daily. Big companies move slowly because of process. If you're also moving slowly, you have no edge. Compress the feedback loop to hours, not weeks.",
      "Fundraising follows traction — build something people want, and investors come to you. The best fundraising meetings are demos, not decks. Show user growth, retention curves, and customer love letters.",
      "Pick a wedge market so small that incumbents ignore it — then expand from that beachhead. Facebook started at Harvard. Uber started with black cars in SF. Dominating one niche gives you the credibility and learnings to take the next.",
    ],
  },
  "Design & UX": {
    summary:
      "The best products feel invisible. Guests stress that great design is about removing steps, not adding polish. User research should be fast and frequent, not a quarterly ceremony. The most impactful design decisions often look like simplification.",
    takeaways: [
      "Remove one step from your user flow every sprint — the fastest path to value wins. Every additional click, field, or screen is a point where users drop off. Audit your flows ruthlessly: does this step earn its place?",
      "Watch 5 users use your product before every major launch — you'll catch 80% of problems. You don't need a formal research study. 5 sessions of 15 minutes with screen share will reveal more than any survey.",
      "Design for the user's job-to-be-done, not their feature requests — they describe solutions, you need to find the real problem. When users say 'I need an export button,' they really mean 'I need to share this with my boss.' Those lead to very different designs.",
      "Consistency beats novelty — users prefer familiar patterns over clever new interactions. Innovative UI patterns feel good to designers but confuse users. Reserve novelty for your core differentiator; use conventions for everything else.",
      "Invest in empty states and error states — they're the moments users are most frustrated and most likely to churn. A thoughtful empty state that guides users to their first action can improve activation by 20-30%.",
    ],
  },
  Engineering: {
    summary:
      "The best engineering cultures ship fast and learn faster. Guests highlight that technical excellence means choosing the right trade-offs, not building the perfect system. The strongest eng teams are deeply connected to users and business outcomes.",
    takeaways: [
      "Invest in developer experience early — fast CI/CD and easy deploys compound into massive velocity gains. If your deploys take 30 minutes, every engineer loses hours per week. Cutting that to 5 minutes pays dividends for years.",
      "Technical debt is a business decision, not just an engineering one — frame it in terms of shipped features per week. 'We need to refactor' doesn't resonate. 'Refactoring will let us ship 2 features/month instead of 1' does.",
      "The best engineers think like product managers — they understand the 'why' behind what they're building. Engineers who understand user context make better architecture decisions, catch edge cases earlier, and propose better solutions.",
      "Ship incremental improvements over big rewrites — rewrites almost always take 3x longer than estimated. The strangler pattern (gradually replacing old code while keeping the system running) is almost always safer and faster than starting from scratch.",
      "Measure what matters for engineering health: deployment frequency, lead time for changes, mean time to recovery, and change failure rate. These four DORA metrics predict both engineering performance and business outcomes.",
    ],
  },
  "Pricing & Monetization": {
    summary:
      "Pricing is the most under-invested lever in most startups. Guests consistently argue that most companies under-price and wait too long to charge. The right pricing strategy aligns what you charge with the value users receive.",
    takeaways: [
      "Charge earlier than you think — free users give worse feedback than paying customers. Paying users have skin in the game and will tell you what's actually valuable. Free users request everything because nothing costs them anything.",
      "Price on value delivered, not cost to serve — if your product saves users $10K/month, charging $500 is a steal. Understand the economic impact you create, then capture a fraction of it. This also gives you room for price increases as you add value.",
      "Run pricing experiments continuously — a 10% price increase with no churn drops straight to the bottom line. Most companies set their price once and never revisit. The best companies treat pricing as a product that needs iteration.",
      "Offer 3 tiers: a free/cheap entry point, a core plan for most users, and a premium plan that anchors high value. This lets users self-select and gives your sales team room to negotiate enterprise deals.",
      "Usage-based pricing aligns incentives but creates unpredictability — pair it with a base subscription for revenue stability. The best models combine a predictable monthly base with variable usage that scales with value delivered.",
    ],
  },
  "Sales & GTM": {
    summary:
      "The best go-to-market motions start with a wedge, not the whole platform. Guests stress that product-led growth and sales-led growth aren't opposites — the best companies layer sales on top of product adoption. Enterprise deals are won by solving a specific pain point first.",
    takeaways: [
      "Land with one use case, then expand — trying to sell the whole platform upfront overwhelms buyers. Slack didn't sell 'enterprise communication.' They sold 'replace email for your engineering team.' The rest followed naturally.",
      "Build sales on top of product usage — your best enterprise leads are already using your free tier. Track which companies have multiple free users, then reach out with an offer to centralize billing and add admin controls.",
      "Customer success drives expansion revenue more than net-new sales — invest in making existing customers wildly successful. A customer who gets 10x ROI from your product will expand their contract, refer peers, and defend you against competitors.",
      "The best sales reps are product experts who genuinely help customers, not just closers. In technical B2B sales, trust is built through competence. Your reps should be able to demo, diagnose problems, and suggest workflows.",
      "Define your ideal customer profile (ICP) precisely — selling to everyone is selling to no one. The best GTM teams can describe their ideal customer by company size, industry, tech stack, and the specific pain they feel. This focus accelerates every part of the funnel.",
    ],
  },
  "Career & Personal Growth": {
    summary:
      "Career growth comes from taking uncomfortable bets and building a track record of impact. Guests advise optimizing for learning in your first roles, then leveraging that expertise into bigger opportunities. Your network and reputation compound over time.",
    takeaways: [
      "Join a rocket ship early in your career — growth companies create more opportunities than stable ones. When a company is growing 3x/year, new roles, teams, and leadership positions are constantly being created. You'll advance faster by riding that wave.",
      "Build in public — writing, speaking, and sharing your work creates opportunities you can't predict. A well-crafted blog post or talk can open doors that no amount of networking will. It's asymmetric: one post, thousands of impressions.",
      "The best career moves feel risky at the time — lean into the roles that scare you a little. Comfort is the enemy of growth. If a new opportunity doesn't make you slightly nervous, it probably won't teach you much.",
      "Find a mentor who's 2-3 steps ahead, not 20 — their advice will be more relevant and actionable. A VP who just made the leap from director remembers the challenges more vividly than a C-suite executive who did it 15 years ago.",
      "Develop a 'T-shaped' skill set — deep expertise in one area with broad knowledge across many. The most valuable product people combine deep domain knowledge (growth, design, data) with the ability to collaborate across engineering, marketing, and sales.",
    ],
  },
  "User Psychology": {
    summary:
      "Products that stick tap into core human motivations: progress, belonging, and mastery. Guests highlight that the best engagement loops create genuine value, not just dopamine hits. Understanding why users behave the way they do is the foundation of every great product.",
    takeaways: [
      "Design for habits, not just features — trigger → action → reward → investment is the core loop. The most successful products (Instagram, Duolingo, Slack) aren't just useful; they're habitual. Map your product to Nir Eyal's Hook Model.",
      "Social proof is your most powerful conversion tool — show users what people like them are doing. 'Join 50,000 product managers' is more persuasive than any feature list. Testimonials, usage stats, and peer activity drive action.",
      "Reduce cognitive load at every step — confused users don't convert, they leave. Every decision you ask a user to make (which plan? which template? which option?) is a moment of friction. Default to the best choice and let power users customize.",
      "The best onboarding gets users to their 'aha moment' in under 60 seconds. Identify the single action that correlates with long-term retention, then ruthlessly optimize the path to that first action. Everything else is a distraction.",
      "Loss aversion is stronger than gain motivation — frame your value proposition around what users stand to lose without your product, not just what they gain. 'Stop losing 5 hours/week to manual reporting' beats 'Save time with automated reports.'",
    ],
  },
  "Data & Analytics": {
    summary:
      "Data-informed beats data-driven. Guests warn against letting metrics replace judgment — the best teams use data to challenge assumptions, not to avoid making decisions. Experimentation culture matters more than any single A/B test.",
    takeaways: [
      "Instrument everything from day one — you can't learn from data you didn't collect. Set up event tracking for every core action before launch. The cost of adding analytics early is tiny; the cost of making blind decisions for months is huge.",
      "Run experiments to learn, not just to validate — the most valuable tests are the ones that surprise you. If you only test ideas you're confident about, you're not learning. The best growth teams run bold experiments that test their assumptions.",
      "Dashboards should answer 'so what?' not just 'what happened' — tie every metric to a decision. A chart showing DAU trending down is useless without context. Add thresholds, comparisons, and suggested actions to make dashboards actionable.",
      "Beware vanity metrics — total signups mean nothing if weekly active usage is declining. Focus on rate metrics (retention rate, activation rate, engagement rate) over cumulative metrics. Rates tell you about product health; totals tell you about history.",
      "Build a data culture, not just a data team — the best companies make data accessible to everyone, not locked behind analyst queues. Self-serve dashboards, SQL training for PMs, and a shared data dictionary democratize decision-making.",
    ],
  },
};

const THEME_COLORS: Record<string, string> = {
  "AI & Machine Learning": "text-purple-400",
  "Growth & Metrics": "text-emerald-400",
  "Leadership & Management": "text-amber-400",
  "Product Strategy": "text-blue-400",
  "Startup Building": "text-red-400",
  "Design & UX": "text-pink-400",
  "Engineering": "text-cyan-400",
  "Pricing & Monetization": "text-orange-400",
  "Sales & GTM": "text-violet-400",
  "Career & Personal Growth": "text-teal-400",
  "User Psychology": "text-fuchsia-400",
  "Data & Analytics": "text-indigo-400",
};

export default function TopicBubblesSection({
  themes,
  quotes,
  guests,
}: {
  themes: Theme[];
  quotes: Quote[];
  guests: Guest[];
}) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const filteredQuotes = selectedTheme
    ? quotes.filter((q) => q.themes.includes(selectedTheme))
    : [];

  const themeSummary = selectedTheme ? THEME_SUMMARIES[selectedTheme] : null;

  // Get guests who have this theme, sorted by word count (proxy for depth of coverage)
  const themeGuests = selectedTheme
    ? guests
        .filter((g) => g.themes.includes(selectedTheme))
        .sort((a, b) => b.wordCount - a.wordCount)
    : [];

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

          {/* Guest Experts */}
          {themeGuests.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
                Guest Experts
                <span className="text-muted font-normal normal-case ml-2">
                  {themeGuests.length} guests covered this topic
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themeGuests.slice(0, 8).map((guest) => (
                  <Link
                    key={guest.slug}
                    href={`/guests/${guest.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-surface-light transition-colors border border-surface-light group"
                  >
                    <div className={`w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold shrink-0 ${THEME_COLORS[selectedTheme] || "text-accent"}`}>
                      {guest.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                        {guest.name}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {guest.description}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0 ml-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
              {themeGuests.length > 8 && (
                <Link
                  href="/guests"
                  className="inline-block mt-3 text-sm text-accent hover:underline"
                >
                  View all {themeGuests.length} guests &rarr;
                </Link>
              )}
            </div>
          )}

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
