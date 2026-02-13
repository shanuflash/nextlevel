import { ImageResponse } from "@vercel/og";
import { db } from "@/src/lib/auth";
import { game } from "@/schema/game-schema";
import { desc, eq } from "drizzle-orm";

export const revalidate = 86400;
export const alt = "NextLevel — Your Gaming Catalog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  // Grab a few popular game covers for the background collage
  const featuredGames = await db
    .select({ coverImageId: game.coverImageId, title: game.title })
    .from(game)
    .where(eq(game.isFeaturedReleased, true))
    .orderBy(desc(game.popularity))
    .limit(8);

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
      {/* Background game cover collage — faded */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          opacity: 0.08,
        }}
      >
        {featuredGames.map((g, i) =>
          g.coverImageId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`}
              alt=""
              width={300}
              height={400}
              style={{ objectFit: "cover", width: 300, height: 315 }}
            />
          ) : null
        )}
      </div>

      {/* Gradient overlays for depth */}
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
      {/* Bottom fade for clean text area */}
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
      {/* Top fade */}
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

      {/* Main content */}
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
        {/* Decorative accent line */}
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

        {/* Logo */}
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

        {/* Tagline */}
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

        {/* Feature pills */}
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

      {/* Floating game covers on the right */}
      {featuredGames.length >= 3 && (
        <div
          style={{
            position: "absolute",
            right: 60,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: "14px",
            alignItems: "center",
          }}
        >
          {featuredGames.slice(0, 3).map((g, i) => (
            <div
              key={i}
              style={{
                width: 130,
                height: 174,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                transform:
                  i === 1 ? "translateY(-20px) scale(1.05)" : "translateY(0)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              {g.coverImageId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`}
                  alt=""
                  width={130}
                  height={174}
                  style={{ objectFit: "cover", width: 130, height: 174 }}
                />
              ) : (
                <div
                  style={{
                    width: 130,
                    height: 174,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>,
    { ...size }
  );
}
