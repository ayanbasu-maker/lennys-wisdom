import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Lenny's Wisdom Engine";
  const subtitle = searchParams.get("subtitle") || "830K+ words of product wisdom from 50 episodes";
  const guest = searchParams.get("guest") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #1a1f2e 0%, #232a3b 50%, #1a1f2e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #5b8fb9, #7c3aed, #ec4899)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "6px 16px",
              background: "rgba(91, 143, 185, 0.15)",
              border: "1px solid rgba(91, 143, 185, 0.3)",
              borderRadius: "20px",
              color: "#5b8fb9",
              fontSize: "18px",
              fontWeight: 500,
            }}
          >
            50 episodes &middot; 830,000+ words &middot; 12 themes
          </div>
        </div>

        {/* Guest avatar + name */}
        {guest && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "28px",
                background: "rgba(91, 143, 185, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5b8fb9",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              {guest
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div style={{ color: "#5b8fb9", fontSize: "24px", fontWeight: 600 }}>
              {guest}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: guest ? "48px" : "64px",
            fontWeight: 700,
            color: "#c8d1e0",
            lineHeight: 1.1,
            marginBottom: "16px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#8892a4",
            lineHeight: 1.4,
            maxWidth: "800px",
          }}
        >
          {subtitle}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#8892a4", fontSize: "18px" }}>
            Built by Ayan Basu
          </div>
          <div style={{ color: "#5b8fb9", fontSize: "18px" }}>
            ayanbasu.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
