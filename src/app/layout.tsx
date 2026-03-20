import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Lenny's Wisdom Engine | 830K+ Words of Product Wisdom",
  description: "Explore insights from 50 episodes of Lenny's Podcast — 830,000+ words of product wisdom from Marc Andreessen, Stewart Butterfield, Melanie Perkins, and more.",
  openGraph: {
    title: "Lenny's Wisdom Engine",
    description: "830K+ words of product wisdom from 50 Lenny's Podcast episodes, visualized and searchable.",
    type: "website",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenny's Wisdom Engine",
    description: "830K+ words of product wisdom from 50 Lenny's Podcast episodes, visualized and searchable.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <Nav />
        <main>{children}</main>
        <footer className="border-t border-surface-light py-8 mt-20">
          <div className="max-w-6xl mx-auto px-6 text-center text-muted text-sm">
            <p>
              Built by{" "}
              <a href="https://ayanbasu.com" className="text-accent hover:text-accent-light transition-colors">
                Ayan Basu
              </a>{" "}
              with data from{" "}
              <a href="https://www.lennyspodcast.com" className="text-accent hover:text-accent-light transition-colors">
                Lenny&apos;s Podcast
              </a>
            </p>
            <p className="mt-1 text-xs">50 episodes &middot; 830,000+ words &middot; 12 themes</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
