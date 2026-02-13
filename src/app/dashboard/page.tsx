import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { userGame } from "@/schema/game-schema";
import { user } from "@/schema/auth-schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { igdbCover, fetchHypeGames, fetchRecentReleases } from "@/src/lib/igdb";
import { CATEGORIES } from "@/src/lib/constants";
import { ProfileUrlCopy } from "./profile-url-copy";

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

  const [categoryCounts, hypeGames, recentGames, dbUser] = await Promise.all([
    db
      .select({
        category: userGame.category,
        count: count(),
      })
      .from(userGame)
      .where(eq(userGame.userId, userId))
      .groupBy(userGame.category),
    fetchHypeGames(5),
    fetchRecentReleases(5),
    db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { username: true },
    }),
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
          <p className="text-white/40 text-sm mt-1">
            Here&apos;s an overview of your game catalog.
          </p>
        </div>
        {username && <ProfileUrlCopy username={username} />}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="relative bg-white/3 rounded-2xl border border-white/8 p-5 overflow-hidden">
          <div className="text-2xl font-bold text-primary">{totalGames}</div>
          <div className="text-xs text-white/40 mt-1">Total Games</div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-primary/80" />
        </div>
        {CATEGORIES.map((cat) => {
          const bars: Record<string, string> = {
            finished: "from-emerald-500 to-emerald-400",
            playing: "from-blue-500 to-blue-400",
            "want-to-play": "from-amber-500 to-amber-400",
            "on-hold": "from-orange-500 to-orange-400",
            dropped: "from-red-500 to-red-400",
          };
          return (
            <div
              key={cat.id}
              className="relative bg-white/3 rounded-2xl border border-white/8 p-5 overflow-hidden"
            >
              <div className={`text-2xl font-bold ${cat.color}`}>
                {categoryMap[cat.id] || 0}
              </div>
              <div className="text-xs text-white/40 mt-1">
                {cat.label}
              </div>
              <div
                className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${bars[cat.id]}`}
              />
            </div>
          );
        })}
      </div>

      {/* Most Anticipated — Letterboxd style */}
      {hypeGames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Most Anticipated
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {hypeGames.map((g) => {
              const coverUrl = igdbCover(g.coverImageId, "t_cover_big_2x");
              return (
                <Link
                  key={g.igdbId}
                  href={`/game/${g.igdbId}`}
                  className="group relative"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/25 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={g.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-3xl text-white/10">
                        🎮
                      </div>
                    )}
                    {/* Release date badge */}
                    {g.releaseDate && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                        {relativeDate(g.releaseDate)}
                      </div>
                    )}
                    {/* Bottom gradient with title */}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-12">
                      <p className="text-xs font-semibold leading-tight line-clamp-2">
                        {g.title}
                      </p>
                      <p className="text-[10px] mt-0.5 text-white/40">
                        {g.hypes.toLocaleString()} hype
                        {g.genres.length > 0 && ` · ${g.genres[0]}`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Released */}
      {recentGames.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Recently Released
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {recentGames.map((g) => {
              const coverUrl = igdbCover(g.coverImageId, "t_cover_big_2x");
              return (
                <Link
                  key={g.igdbId}
                  href={`/game/${g.igdbId}`}
                  className="group relative"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/25 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-black/40">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={g.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-3xl text-white/10">
                        🎮
                      </div>
                    )}
                    {/* Release date badge */}
                    {g.releaseDate && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                        {relativeDate(g.releaseDate)}
                      </div>
                    )}
                    {/* Bottom gradient with title */}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-12">
                      <p className="text-xs font-semibold leading-tight line-clamp-2">
                        {g.title}
                      </p>
                      <p className="text-[10px] mt-0.5 text-white/40">
                        {g.genres.length > 0 ? g.genres.slice(0, 2).join(" · ") : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/games"
          className="bg-white/3 rounded-2xl border border-white/8 p-6 hover:bg-white/5 transition-colors group"
        >
          <div className="text-lg font-semibold group-hover:text-primary transition-colors">
            Manage Games
          </div>
          <p className="text-white/40 text-sm mt-1">
            Add, edit, or remove games from your catalog.
          </p>
        </Link>
        <Link
          href="/dashboard/settings"
          className="bg-white/3 rounded-2xl border border-white/8 p-6 hover:bg-white/5 transition-colors group"
        >
          <div className="text-lg font-semibold group-hover:text-primary transition-colors">
            Profile Settings
          </div>
          <p className="text-white/40 text-sm mt-1">
            Edit your username, bio, and profile details.
          </p>
        </Link>
      </div>

      {totalGames === 0 && (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-lg font-semibold">No games yet</h2>
          <p className="text-white/40 text-sm mt-1 mb-6">
            Start building your catalog by adding your first game.
          </p>
          <Link
            href="/dashboard/games"
            className="inline-flex px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Add Your First Game
          </Link>
        </div>
      )}
    </div>
  );
}
