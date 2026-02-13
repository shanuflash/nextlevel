import { ImageResponse } from "@vercel/og";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { eq, and, desc, count } from "drizzle-orm";

export const runtime = "edge";
export const revalidate = 3600;
export const alt = "NextLevel Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProfileOG({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.username, username),
  });

  if (!dbUser) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090d",
          color: "rgba(255,255,255,0.3)",
          fontSize: 32,
          fontFamily: "sans-serif",
        }}
      >
        User not found
      </div>,
      { ...size }
    );
  }

  const [
    [totalCount],
    [finishedCount],
    [playingCount],
    currentlyPlaying,
    bgGames,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(userGame)
      .where(eq(userGame.userId, dbUser.id)),
    db
      .select({ count: count() })
      .from(userGame)
      .where(
        and(eq(userGame.userId, dbUser.id), eq(userGame.category, "finished"))
      ),
    db
      .select({ count: count() })
      .from(userGame)
      .where(
        and(eq(userGame.userId, dbUser.id), eq(userGame.category, "playing"))
      ),
    db
      .select({
        title: game.title,
        coverImageId: game.coverImageId,
      })
      .from(userGame)
      .innerJoin(game, eq(userGame.gameId, game.id))
      .where(
        and(eq(userGame.userId, dbUser.id), eq(userGame.category, "playing"))
      )
      .orderBy(desc(game.popularity))
      .limit(5),
    db
      .select({ coverImageId: game.coverImageId })
      .from(userGame)
      .innerJoin(game, eq(userGame.gameId, game.id))
      .where(eq(userGame.userId, dbUser.id))
      .orderBy(desc(game.popularity))
      .limit(8),
  ]);

  const total = totalCount?.count ?? 0;
  const finished = finishedCount?.count ?? 0;
  const playing = playingCount?.count ?? 0;

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
        {bgGames.map((g, i) =>
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

        {/* User identity — replaces the logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "rgba(217,70,168,0.2)",
              border: "1px solid rgba(217,70,168,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#d946a8",
            }}
          >
            {dbUser.name[0].toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              {dbUser.name}
            </span>
            <span style={{ fontSize: 22, color: "rgba(255,255,255,0.35)" }}>
              @{dbUser.username}
            </span>
          </div>
        </div>

        {/* Bio — replaces the tagline */}
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
            maxWidth: 600,
          }}
        >
          {dbUser.bio
            ? dbUser.bio.slice(0, 100)
            : "Track, organize, and share your gaming journey."}
        </div>

        {/* Stats pills — replaces the feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          {[
            { label: `${total} Games`, highlight: true },
            { label: `${finished} Finished`, highlight: false },
            { label: `${playing} Playing`, highlight: false },
          ].map((pill, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                borderRadius: 999,
                backgroundColor: pill.highlight
                  ? "rgba(217,70,168,0.15)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${pill.highlight ? "rgba(217,70,168,0.3)" : "rgba(255,255,255,0.08)"}`,
                fontSize: 16,
                fontWeight: 600,
                color: pill.highlight ? "#d946a8" : "rgba(255,255,255,0.4)",
              }}
            >
              {pill.label}
            </div>
          ))}
        </div>
      </div>

      {/* Floating currently-playing covers on the right */}
      {currentlyPlaying.length > 0 && (
        <div
          style={{
            position: "absolute",
            right: 60,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {currentlyPlaying.map((g, i) => {
            const mid = Math.floor(currentlyPlaying.length / 2);
            const isCenter = currentlyPlaying.length >= 3 && i === mid;
            return (
              <div
                key={i}
                style={{
                  width: 105,
                  height: 140,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  transform: isCenter
                    ? "translateY(-16px) scale(1.05)"
                    : "translateY(0)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                }}
              >
                {g.coverImageId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`}
                    alt=""
                    width={105}
                    height={140}
                    style={{ objectFit: "cover", width: 105, height: 140 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 105,
                      height: 140,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>,
    { ...size }
  );
}
