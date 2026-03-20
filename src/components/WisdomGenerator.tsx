"use client";

import { useState, useEffect } from "react";
import { Quote } from "@/lib/data";

export default function WisdomGenerator({ quotes }: { quotes: Quote[] }) {
  const [current, setCurrent] = useState<Quote>(quotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    setCurrent(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [quotes]);

  const getNew = () => {
    setIsAnimating(true);
    setTimeout(() => {
      let next: Quote;
      do {
        next = quotes[Math.floor(Math.random() * quotes.length)];
      } while (next.text === current.text && quotes.length > 1);
      setCurrent(next);
      setIsAnimating(false);
    }, 300);
  };

  const shareOnLinkedIn = () => {
    const text = `"${current.text}"\n\n— ${current.speaker} on Lenny's Podcast\n\nExplore more wisdom from 50 episodes at:`;
    const url = encodeURIComponent(window.location.origin);
    const shareText = encodeURIComponent(text);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${shareText}`,
      "_blank",
      "width=600,height=600"
    );
  };

  const copyQuote = () => {
    navigator.clipboard.writeText(
      `"${current.text}" — ${current.speaker} on Lenny's Podcast`
    );
  };

  return (
    <div className="relative bg-surface rounded-2xl p-8 md:p-10 border border-surface-light overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />

      <div className="flex items-start gap-4 mb-6">
        <div className="text-5xl text-accent/30 font-serif leading-none">&ldquo;</div>
        <div
          className={`flex-1 transition-all duration-300 ${
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <p className="text-lg md:text-xl text-foreground leading-relaxed font-light">
            {current.text}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
              {current.speaker[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{current.speaker}</p>
              <p className="text-xs text-muted">{current.episodeTitle}</p>
            </div>
          </div>
          {current.themes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {current.themes.slice(0, 3).map((theme) => (
                <span
                  key={theme}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={getNew}
          className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-accent/20"
        >
          New Wisdom
        </button>
        <button
          onClick={shareOnLinkedIn}
          className="px-5 py-2.5 bg-[#0077b5] hover:bg-[#006097] text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-[#0077b5]/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Share on LinkedIn
        </button>
        <button
          onClick={copyQuote}
          className="px-5 py-2.5 bg-surface-light hover:bg-surface text-foreground text-sm font-medium rounded-lg transition-all border border-surface-light hover:border-muted"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
