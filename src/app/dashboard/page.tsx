import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { user } from "@/schema/auth-schema";
import { eq, count, desc } from "drizzle-orm";
import { ProfileUrlCopy } from "./profile-url-copy";
import { DashboardStats } from "./dashboard-stats";
import { GameCard } from "@/src/components/game-card";

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  if (diffDays > 0) {
    if (diffDays < 30) return `In ${diffDays}d`;
    if (diffDays < 365) return `In ${Math.round(diffDays / 30)}mo`;
    return `In ${Math.round(diffDays / 365)}y`;
  }

  const absDays = Math.abs(diffDays);
  if (absDays < 30) return `${absDays}d ago`;
  if (absDays < 365) return `${Math.round(absDays / 30)}mo ago`;
  return `${Math.round(absDays / 365)}y ago`;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const userId = session.user.id;

  const [categoryCounts, hypeGames, recentGames, dbUser, popularGames] =
    await Promise.all([
      db
        .select({
          category: userGame.category,
          count: count(),
        })
        .from(userGame)
        .where(eq(userGame.userId, userId))
        .groupBy(userGame.category),
      db
        .select()
        .from(game)
        .where(eq(game.isFeaturedAnticipated, true))
        .orderBy(desc(game.popularity))
        .limit(5),
      db
        .select()
        .from(game)
        .where(eq(game.isFeaturedReleased, true))
        .orderBy(desc(game.popularity))
        .limit(5),
      db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { username: true },
      }),
      db
        .select({
          igdbId: game.igdbId,
          title: game.title,
          coverImageId: game.coverImageId,
          genres: game.genres,
        })
        .from(game)
        .orderBy(desc(game.popularity))
        .limit(10),
    ]);

  const username = dbUser?.username;

  const totalGames = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  const categoryMap: Record<string, number> = {};
  for (const c of categoryCounts) {
    categoryMap[c.category] = c.count;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-white/40 text-sm mt-1">Your catalog overview.</p>
        </div>
        {username && <ProfileUrlCopy username={username} />}
      </div>

      <DashboardStats
        totalGames={totalGames}
        categoryMap={categoryMap}
        popularGames={popularGames}
      />

      {hypeGames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Most Anticipated
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {hypeGames.map((g) => (
              <GameCard
                key={g.igdbId}
                href={`/game/${g.igdbId}`}
                title={g.title}
                coverImageId={g.coverImageId}
                subtitle={g.genres?.split(", ")[0]}
                badge={
                  g.releaseDate
                    ? {
                        text: relativeDate(g.releaseDate),
                        className: "bg-black/70 text-emerald-400",
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {recentGames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Recently Released
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {recentGames.map((g) => (
              <GameCard
                key={g.igdbId}
                href={`/game/${g.igdbId}`}
                title={g.title}
                coverImageId={g.coverImageId}
                subtitle={g.genres?.split(", ").slice(0, 2).join(" · ")}
                badge={
                  g.releaseDate
                    ? {
                        text: relativeDate(g.releaseDate),
                        className: "bg-black/70 text-blue-400",
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
