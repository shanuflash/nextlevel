import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const revalidate = 604800; // 7 days
export const alt = "NextLevel — Your Gaming Catalog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#09090d",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Decorative "cards" background (no network fetches). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          opacity: 0.18,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 520,
            height: 760,
            borderRadius: 44,
            background:
              "linear-gradient(135deg, rgba(217,70,168,0.35), rgba(99,60,255,0.18))",
            transform: "rotate(-12deg)",
            filter: "blur(0.2px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -120,
            width: 560,
            height: 820,
            borderRadius: 52,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))",
            transform: "rotate(14deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: 260,
            width: 600,
            height: 860,
            borderRadius: 56,
            background:
              "linear-gradient(135deg, rgba(99,60,255,0.22), rgba(217,70,168,0.12))",
            transform: "rotate(6deg)",
            display: "flex",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 80% 70% at 30% 50%, rgba(217,70,168,0.12) 0%, transparent 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 60% 50% at 80% 80%, rgba(99,60,255,0.10) 0%, transparent 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "70%",
          background: "linear-gradient(to top, #09090d 30%, transparent 100%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background:
            "linear-gradient(to bottom, #09090d 10%, transparent 100%)",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px 72px",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: 60,
            height: 4,
            borderRadius: 2,
            background:
              "linear-gradient(to right, #d946a8, rgba(99,60,255,0.6))",
            marginBottom: "8px",
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            display: "flex",
          }}
        >
          <span style={{ color: "#ffffff" }}>Next</span>
          <span style={{ color: "#d946a8" }}>Level</span>
        </div>

        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
            maxWidth: 600,
          }}
        >
          Track, organize, and share your gaming journey.
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          {["Catalog", "Progress", "Discover", "Share"].map((label, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                borderRadius: 999,
                backgroundColor:
                  i === 0 ? "rgba(217,70,168,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${i === 0 ? "rgba(217,70,168,0.3)" : "rgba(255,255,255,0.08)"}`,
                fontSize: 16,
                fontWeight: 600,
                color: i === 0 ? "#d946a8" : "rgba(255,255,255,0.4)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      headers: {
        // Cache at the edge; crawlers retry and benefit heavily.
        "Cache-Control":
          "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400",
      },
    }
  );
}
