"use client";

import { useEffect, useRef, useState } from "react";
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

interface BubbleData {
  name: string;
  count: number;
  color: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

export default function TopicBubbles({
  themes,
  onThemeClick,
}: {
  themes: Theme[];
  onThemeClick: (theme: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<BubbleData[]>([]);
  const animFrameRef = useRef<number>(0);
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.min(500, container.clientWidth * 0.6),
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const { width, height } = dimensions;
    const maxCount = Math.max(...themes.map((t) => t.count));
    const minRadius = width < 600 ? 30 : 40;
    const maxRadius = width < 600 ? 60 : 85;

    bubblesRef.current = themes.map((theme, i) => {
      const radius =
        minRadius + ((theme.count / maxCount) * (maxRadius - minRadius));
      const angle = (i / themes.length) * Math.PI * 2;
      const spread = Math.min(width, height) * 0.3;
      return {
        name: theme.name,
        count: theme.count,
        color: THEME_COLORS[theme.name] || "#5b8fb9",
        x: width / 2 + Math.cos(angle) * spread + (Math.random() - 0.5) * 40,
        y: height / 2 + Math.sin(angle) * spread + (Math.random() - 0.5) * 40,
        radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      };
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const bubbles = bubblesRef.current;

      // Physics: gentle attraction to center + collision
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Attract to center
        b.vx += (width / 2 - b.x) * 0.0003;
        b.vy += (height / 2 - b.y) * 0.0003;

        // Collision with other bubbles
        for (let j = i + 1; j < bubbles.length; j++) {
          const other = bubbles[j];
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.radius + other.radius + 4;

          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) / dist * 0.02;
            b.vx -= dx * force;
            b.vy -= dy * force;
            other.vx += dx * force;
            other.vy += dy * force;
          }
        }

        // Boundary
        if (b.x - b.radius < 0) b.vx += 0.5;
        if (b.x + b.radius > width) b.vx -= 0.5;
        if (b.y - b.radius < 0) b.vy += 0.5;
        if (b.y + b.radius > height) b.vy -= 0.5;

        // Damping
        b.vx *= 0.98;
        b.vy *= 0.98;

        b.x += b.vx;
        b.y += b.vy;
      }

      // Draw bubbles
      for (const b of bubbles) {
        const isHovered = hoveredBubble === b.name;

        // Glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          b.x, b.y, b.radius * 0.5,
          b.x, b.y, b.radius * 1.3
        );
        gradient.addColorStop(0, b.color + (isHovered ? "40" : "20"));
        gradient.addColorStop(1, b.color + "00");
        ctx.arc(b.x, b.y, b.radius * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main bubble
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color + (isHovered ? "35" : "18");
        ctx.fill();
        ctx.strokeStyle = b.color + (isHovered ? "90" : "50");
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Label
        const shortName = b.name.replace(" & ", " &\n").replace(" & ", "\n& ");
        const lines = shortName.split("\n");
        const fontSize = Math.max(10, Math.min(b.radius * 0.28, 14));
        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = isHovered ? "#ffffff" : "#c8d1e0";

        const lineHeight = fontSize * 1.3;
        const startY = b.y - ((lines.length - 1) * lineHeight) / 2 - 4;
        for (let l = 0; l < lines.length; l++) {
          ctx.fillText(lines[l], b.x, startY + l * lineHeight);
        }

        // Count
        ctx.font = `500 ${fontSize * 0.85}px Inter, sans-serif`;
        ctx.fillStyle = b.color + "cc";
        ctx.fillText(
          `${b.count} episodes`,
          b.x,
          startY + lines.length * lineHeight + 2
        );
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [themes, dimensions, hoveredBubble]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: string | null = null;
    for (const b of bubblesRef.current) {
      const dx = x - b.x;
      const dy = y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < b.radius) {
        found = b.name;
        break;
      }
    }
    setHoveredBubble(found);
    canvas.style.cursor = found ? "pointer" : "default";
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const b of bubblesRef.current) {
      const dx = x - b.x;
      const dy = y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < b.radius) {
        onThemeClick(b.name);
        break;
      }
    }
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredBubble(null)}
        onClick={handleClick}
      />
    </div>
  );
}
