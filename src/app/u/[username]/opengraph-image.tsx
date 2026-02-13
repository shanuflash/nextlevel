import { ImageResponse } from "@vercel/og";
import { ogQuery } from "@/src/lib/og-db";

export const runtime = "edge";
export const revalidate = 3600; // 1 hour
export const alt = "NextLevel Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    promise
      .then((v) => resolve(v))
      .catch(() => resolve(null))
      .finally(() => clearTimeout(t));
  });
}

function safeUsername(input: string) {
  const u = (input || "").trim();
  return u.length > 32 ? `${u.slice(0, 32)}…` : u;
}

export default async function ProfileOG({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const u = safeUsername(username);

  type ProfileRow = {
    id: string;
    name: string;
    username: string | null;
    bio: string | null;
    total: number;
    finished: number;
    playing: number;
  };

  const dbUser = await withTimeout(
    ogQuery<ProfileRow>(
      `
      SELECT
        u.id,
        u.name,
        u.username,
        u.bio,
        (SELECT COUNT(*) FROM user_game ug WHERE ug.user_id = u.id) AS total,
        (SELECT COUNT(*) FROM user_game ug WHERE ug.user_id = u.id AND ug.category = 'finished') AS finished,
        (SELECT COUNT(*) FROM user_game ug WHERE ug.user_id = u.id AND ug.category = 'playing') AS playing
      FROM "user" u
      WHERE u.username = ?
      LIMIT 1
      `,
      [username]
    ).then((rows) => rows[0] ?? null),
    900
  );

  if (!dbUser) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090d",
          color: "rgba(255,255,255,0.85)",
          fontSize: 44,
          fontFamily: "sans-serif",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 0 }}>
          <span style={{ fontWeight: 800 }}>Next</span>
          <span style={{ fontWeight: 800, color: "#d946a8" }}>Level</span>
        </div>
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.45)" }}>
          @{u}
        </div>
      </div>,
      {
        ...size,
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const total = dbUser.total ?? 0;
  const finished = dbUser.finished ?? 0;
  const playing = dbUser.playing ?? 0;

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
      {/* Decorative card shapes — matches root OG */}
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

      {/* Gradient overlays — matches root OG */}
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

      {/* Content — bottom-left, same layout rhythm as root OG */}
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
        {/* Accent bar */}
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

        {/* Avatar + name row */}
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
              @{dbUser.username ?? u}
            </span>
          </div>
        </div>

        {/* Bio (only if user has one) */}
        {dbUser.bio && (
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
              maxWidth: 600,
            }}
          >
            {dbUser.bio.slice(0, 100)}
          </div>
        )}

        {/* Stat pills */}
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

      {/* Branding — top-right, bigger */}
      <div
        style={{
          position: "absolute",
          top: 44,
          right: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
          }}
        >
          <span style={{ color: "#ffffff" }}>Next</span>
          <span style={{ color: "#d946a8" }}>Level</span>
        </div>
        <div
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "-0.01em",
          }}
        >
          Track, organize, and share your gaming journey.
        </div>
      </div>
    </div>,
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
