import { getData } from "@/lib/data";

export const metadata = {
  title: "Newsletters | Lenny's Wisdom Engine",
  description: "Summaries and key takeaways from 10 Lenny's Newsletter deep-dives",
};

const NEWSLETTER_INSIGHTS: Record<
  string,
  { summary: string; takeaways: string[] }
> = {
  "how-to-build-your-pm-second-brain-with-chatgpt": {
    summary:
      "Amir Klein from monday.com shares how he uses ChatGPT Projects as a 'second brain' for product management — dumping all context (Slack threads, docs, meeting notes) into a single AI workspace to synthesize information, draft PRDs, and make faster decisions. The key insight: AI doesn't replace your thinking, it amplifies it by handling the context overload that slows PMs down.",
    takeaways: [
      "Create a dedicated ChatGPT/Claude Project for each major initiative — dump all context (docs, Slack threads, meeting notes) into it as your external memory",
      "Use AI to synthesize scattered information before making decisions, not just to generate content",
      "The biggest PM bottleneck isn't ideas or skills — it's context management across dozens of sources",
      "AI as a 'second brain' works best when you feed it real, messy context rather than clean prompts",
    ],
  },
  "everyone-should-be-using-claude-code-more": {
    summary:
      "Lenny argues that Claude Code is the most underrated AI tool for non-technical people. Forget the name — think of it as 'Claude with superpowers' running locally on your machine. He shares 50 creative use cases from his community: organizing files, summarizing customer calls, building internal tools, creating Linear tickets, enhancing images, and much more.",
    takeaways: [
      "Think of Claude Code as 'Claude Local' or 'Claude Agent' — it's not just for coding",
      "Running AI locally lets it handle larger files, longer tasks, and direct computer interactions that cloud chatbots can't",
      "Non-technical people are using it for file organization, data analysis, content creation, and workflow automation",
      "The key unlock is giving AI access to your actual files and system — context is everything",
    ],
  },
  "essential-reading-for-product-builders-part-1": {
    summary:
      "A curated list of 7 timeless essays that every product builder should read but probably hasn't. Lenny applies a 'barbell strategy' to his reading — consuming either very recent content or truly timeless pieces, skipping everything in between. These essays cover topics from competitive strategy to creativity to organizational design.",
    takeaways: [
      "Apply the 'barbell' strategy to your reading: consume either up-to-the-minute content or truly timeless pieces",
      "The best product thinking often comes from outside product management — strategy, psychology, design, and economics",
      "Timeless essays compound in value — re-reading them at different career stages reveals new insights",
      "Build a personal library of foundational reading that shapes how you think, not just what you know",
    ],
  },
  "what-people-are-vibe-coding-and-actually-using": {
    summary:
      "Over 1,000 community responses reveal what non-technical people are actually building with AI coding tools — and using in real life. From buzzer apps to personal CRMs to automated workflows, the examples prove that 'vibe coding' isn't a gimmick. The key: start with a real problem you have, open an AI tool, and just describe what you want.",
    takeaways: [
      "Vibe coding works best when you start with a genuine personal or work problem, not a hypothetical project",
      "The most useful vibe-coded tools are small, specific utilities — not ambitious platforms",
      "Try multiple AI coding tools simultaneously (Cursor, Replit, Claude Code) since they have different strengths",
      "The barrier to building software has effectively dropped to zero — the bottleneck is now identifying what to build",
    ],
  },
  "an-ai-glossary": {
    summary:
      "A plain-English guide to the most common AI terms that product people encounter daily. Covers models, tokens, prompts, fine-tuning, RAG, agents, evals, temperature, hallucinations, and more — explained simply without jargon. Essential reference for anyone who needs to speak fluently about AI without a technical background.",
    takeaways: [
      "An AI model learns patterns from massive datasets, similar to how a child learns language through exposure",
      "Tokens are the units AI models process — roughly ¾ of a word in English. Context windows limit how much the model can 'remember'",
      "RAG (Retrieval-Augmented Generation) lets AI access external knowledge, solving the problem of outdated or missing training data",
      "Temperature controls randomness: low temperature = predictable outputs, high temperature = creative/varied outputs",
    ],
  },
  "state-of-the-product-job-market-in-2025": {
    summary:
      "A data-driven analysis of the PM job market using TrueUp's dataset. The picture is cautiously optimistic: over 6,000 open PM roles globally (53.6% above the 2023 bottom), with AI PM roles growing fastest. The market hasn't fully recovered to 2022 peaks, but the trajectory is clearly positive — especially for PMs with AI skills.",
    takeaways: [
      "PM job openings are up 53.6% from the 2023 low and still climbing — the worst is behind us",
      "AI-related PM roles are the fastest-growing segment, making AI literacy a career accelerator",
      "The market favors PMs who can demonstrate impact with data, not just process expertise",
      "Despite recovery, competition remains fierce — differentiate through specialization and visible work",
    ],
  },
  "beyond-vibe-checks-a-pms-complete-guide-to-evals": {
    summary:
      "Evals (evaluations) are becoming the most critical skill for PMs building AI products. This guide walks through the full eval lifecycle: defining what 'good' looks like, building test datasets, choosing metrics, running systematic evaluations, and iterating on prompts. The key insight: without rigorous evals, you're just vibing — and that doesn't scale.",
    takeaways: [
      "Writing evals is quickly becoming a core PM skill — every AI product needs systematic quality measurement",
      "Start by defining clear, measurable criteria for what 'good' output looks like before building anything",
      "Build diverse test datasets that cover edge cases, not just the happy path",
      "Evals should run automatically and continuously — not just once before launch",
    ],
  },
  "a-guide-to-ai-prototyping-for-product-managers": {
    summary:
      "A practical guide to using AI tools like Cursor, Replit, and v0 to go from idea to working prototype in minutes rather than weeks. The rise of AI-assisted coding means PMs can now build functional prototypes themselves, dramatically shortening the feedback loop between idea and user testing.",
    takeaways: [
      "PMs can now build functional prototypes in minutes using AI coding tools — no engineering resources needed",
      "Use prototypes to test ideas with users before writing a single PRD or involving your engineering team",
      "Start with simple prompts describing what you want, then iterate — don't try to spec everything upfront",
      "The best prototyping workflow: describe → generate → test with users → iterate → hand off to engineering",
    ],
  },
  "product-manager-is-an-unfair-role-so-work-unfairly": {
    summary:
      "Tal Raviv argues that PMs face an inherently unfair role — expected to operate on both maker and manager schedules with no dedicated 'PM time.' The solution: work 'unfairly' by leveraging AI to automate routine work, creating systems instead of doing everything manually, and redefining work norms in the era of the 'great flattening.'",
    takeaways: [
      "PMs are expected to be on both maker and manager schedules — accept this unfairness and build systems to cope",
      "Use AI to handle the routine parts of PM work (status updates, meeting notes, data pulls) so you can focus on judgment calls",
      "The 'great flattening' means fewer layers and more scope per PM — those who leverage tools will thrive",
      "Build repeatable systems for recurring work instead of doing everything from scratch each time",
    ],
  },
  "how-duolingo-reignited-user-growth": {
    summary:
      "Jorge Mazal, former CPO of Duolingo, tells the inside story of how Duolingo went from stagnating growth to 350% DAU acceleration. The transformation came from a systematic approach to gamification: leaderboards drove 17% more time spent, streak mechanics created daily habits, and smart notifications brought users back. The key: treat growth as a product, not a marketing function.",
    takeaways: [
      "Duolingo's growth breakthrough came from gamification mechanics (leaderboards, streaks, notifications), not marketing spend",
      "Leaderboards alone drove 17% more learning time — competition is a powerful motivator when designed well",
      "Streaks create daily habits that compound into long-term retention — the fear of losing a streak is stronger than the desire to learn",
      "Treat growth as a product discipline with its own team, metrics, and experimentation culture — not a side project",
    ],
  },
};

export default function NewslettersPage() {
  const data = getData();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Newsletters</h1>
      <p className="text-muted mb-10">
        {data.newsletters.length} deep-dive essays with summaries and key takeaways
      </p>

      <div className="space-y-8">
        {data.newsletters.map((nl) => {
          const insights = NEWSLETTER_INSIGHTS[nl.slug];
          return (
            <article
              key={nl.slug}
              className="bg-surface rounded-2xl p-6 border border-surface-light"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
                  Newsletter
                </span>
                <span className="text-xs text-muted">
                  {new Date(nl.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-1">
                {nl.title}
              </h2>
              {nl.subtitle && (
                <p className="text-sm text-accent/80 mb-4">{nl.subtitle}</p>
              )}

              {/* Summary */}
              {insights && (
                <>
                  <p className="text-sm text-muted leading-relaxed mb-5">
                    {insights.summary}
                  </p>

                  {/* Takeaways */}
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-accent uppercase tracking-wide mb-3">
                      Key Takeaways
                    </h3>
                    <div className="space-y-2.5">
                      {insights.takeaways.map((takeaway, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="text-accent font-bold text-xs mt-0.5 shrink-0">
                            {i + 1}.
                          </span>
                          <p className="text-sm text-foreground leading-relaxed">
                            {takeaway}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Themes */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-surface-light">
                {nl.themes.slice(0, 4).map((theme) => (
                  <span
                    key={theme}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-surface-light text-muted"
                  >
                    {theme}
                  </span>
                ))}
                {nl.themes.length > 4 && (
                  <span className="text-[10px] text-muted">
                    +{nl.themes.length - 4} more
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
