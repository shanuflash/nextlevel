import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { user } from "@/schema/auth-schema";
import { eq, and, count, desc, gt } from "drizzle-orm";
import { ProfileUrlCopy } from "./profile-url-copy";
import { DashboardStats } from "./dashboard-stats";
import { GameCard } from "@/src/components/game-card";
import { LibraryGameCard } from "./library-game-card";
import { CATEGORIES } from "@/src/lib/constants";
import Link from "next/link";

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
  // Featured flags refresh weekly; hide anything that has since released.
  const todayStr = new Date().toISOString().split("T")[0];

  const [
    categoryCounts,
    hypeGames,
    recentGames,
    dbUser,
    popularGames,
    playingGames,
    recentlyAdded,
    library,
  ] = await Promise.all([
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
      .where(
        and(
          eq(game.isFeaturedAnticipated, true),
          gt(game.releaseDate, todayStr)
        )
      )
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
    db
      .select({
        igdbId: game.igdbId,
        title: game.title,
        coverImageId: game.coverImageId,
        genres: game.genres,
      })
      .from(userGame)
      .innerJoin(game, eq(userGame.gameId, game.id))
      .where(and(eq(userGame.userId, userId), eq(userGame.category, "playing")))
      .orderBy(desc(userGame.updatedAt))
      .limit(12),
    db
      .select({
        igdbId: game.igdbId,
        title: game.title,
        coverImageId: game.coverImageId,
        category: userGame.category,
      })
      .from(userGame)
      .innerJoin(game, eq(userGame.gameId, game.id))
      .where(eq(userGame.userId, userId))
      .orderBy(desc(userGame.createdAt))
      .limit(5),
    db
      .select({ igdbId: userGame.igdbId, category: userGame.category })
      .from(userGame)
      .where(eq(userGame.userId, userId)),
  ]);

  // Lets discovery rows show "already in your library" and its status.
  const libraryStatus = new Map(
    library.flatMap((g) => (g.igdbId ? [[g.igdbId, g.category]] : []))
  );

  const username = dbUser?.username;

  const totalGames = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  const categoryMap: Record<string, number> = {};
  for (const c of categoryCounts) {
    categoryMap[c.category] = c.count;
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-3xl font-bold">
          {totalGames > 0 ? "Welcome back" : "Welcome"}, {session.user.name}
        </h1>
        <div className="flex items-center gap-2">
          {username && <ProfileUrlCopy username={username} />}
          {totalGames > 0 && (
            <Link
              href="/dashboard/games?add=1"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 sm:flex-none"
            >
              + Add games
            </Link>
          )}
        </div>
      </div>

      <DashboardStats
        totalGames={totalGames}
        categoryMap={categoryMap}
        popularGames={popularGames}
      />

      {playingGames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Now Playing
            <span className="text-white/30 ml-2">({playingGames.length})</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {playingGames.map((g) => (
              <GameCard
                key={g.igdbId}
                href={`/game/${g.igdbId}`}
                title={g.title}
                coverImageId={g.coverImageId}
                subtitle={g.genres?.split(", ").slice(0, 2).join(" · ")}
              />
            ))}
          </div>
        </div>
      )}

      {recentlyAdded.length > 0 && (
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Recently Added
            </h2>
            <Link
              href="/dashboard/games"
              className="text-xs text-white/35 hover:text-white/70 transition-colors"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {recentlyAdded.map((g) => {
              const cat = CATEGORIES.find((c) => c.id === g.category);
              return (
                <GameCard
                  key={g.igdbId}
                  href={`/game/${g.igdbId}`}
                  title={g.title}
                  coverImageId={g.coverImageId}
                  subtitle={cat?.label}
                  subtitleClassName={cat?.color}
                />
              );
            })}
          </div>
        </div>
      )}

      {hypeGames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Most Anticipated
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {hypeGames.map((g) => (
              <LibraryGameCard
                key={g.igdbId}
                igdbId={g.igdbId}
                initialCategory={libraryStatus.get(g.igdbId)}
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
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {recentGames.map((g) => (
              <LibraryGameCard
                key={g.igdbId}
                igdbId={g.igdbId}
                initialCategory={libraryStatus.get(g.igdbId)}
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
