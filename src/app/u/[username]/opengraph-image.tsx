import { ImageResponse } from "@vercel/og";
import { ogQuery } from "@/src/lib/og-db";

export const runtime = "edge";
export const revalidate = 3600; // 1 hour
export const alt = "NextLevel Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProfileOG({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const users = await ogQuery<{
    id: string;
    name: string;
    username: string | null;
    bio: string | null;
  }>("SELECT id, name, username, bio FROM user WHERE username = ? LIMIT 1", [
    username,
  ]);

  const dbUser = users[0];

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

  const [totalRow, finishedRow, playingRow, currentlyPlaying, bgGames] =
    await Promise.all([
      ogQuery<{ c: number }>(
        "SELECT COUNT(*) as c FROM user_game WHERE user_id = ?",
        [dbUser.id]
      ),
      ogQuery<{ c: number }>(
        "SELECT COUNT(*) as c FROM user_game WHERE user_id = ? AND category = 'finished'",
        [dbUser.id]
      ),
      ogQuery<{ c: number }>(
        "SELECT COUNT(*) as c FROM user_game WHERE user_id = ? AND category = 'playing'",
        [dbUser.id]
      ),
      ogQuery<{ title: string; cover_image_id: string | null }>(
        `SELECT g.title, g.cover_image_id FROM user_game ug
         INNER JOIN game g ON ug.game_id = g.id
         WHERE ug.user_id = ? AND ug.category = 'playing'
         ORDER BY g.popularity DESC LIMIT 5`,
        [dbUser.id]
      ),
      ogQuery<{ cover_image_id: string | null }>(
        `SELECT g.cover_image_id FROM user_game ug
         INNER JOIN game g ON ug.game_id = g.id
         WHERE ug.user_id = ?
         ORDER BY g.popularity DESC LIMIT 8`,
        [dbUser.id]
      ),
    ]);

  const total = totalRow[0]?.c ?? 0;
  const finished = finishedRow[0]?.c ?? 0;
  const playing = playingRow[0]?.c ?? 0;

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
          g.cover_image_id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover_image_id}.jpg`}
              alt=""
              width={300}
              height={400}
              style={{ objectFit: "cover", width: 300, height: 315 }}
            />
          ) : null
        )}
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
                {g.cover_image_id ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover_image_id}.jpg`}
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
