import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { user } from "@/schema/auth-schema";
import { eq, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchIGDBGame, igdbCover } from "@/src/lib/igdb";

import { PublicNav } from "@/src/components/public-nav";
import { CATEGORIES } from "@/src/lib/constants";

interface CategoryStat {
  category: string;
  count: number;
}

interface GameUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  category: string;
  rating: number | null;
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ igdbId: string }>;
}) {
  const { igdbId: igdbIdStr } = await params;
  const igdbId = parseInt(igdbIdStr, 10);
  if (isNaN(igdbId)) notFound();

  const cached = await db.query.game.findFirst({
    where: eq(game.igdbId, igdbId),
  });

  const meta = cached
    ? {
        igdbId: cached.igdbId,
        title: cached.title,
        slug: cached.slug,
        coverImageId: cached.coverImageId,
        genres: cached.genres?.split(", ").filter(Boolean) ?? [],
        platforms: cached.platforms?.split(", ").filter(Boolean) ?? [],
        releaseDate: cached.releaseDate,
        summary: cached.summary,
      }
    : await fetchIGDBGame(igdbId);

  if (!meta) notFound();

  const coverUrl = igdbCover(meta.coverImageId);

  let categoryStats: CategoryStat[] = [];
  let usersWithGame: GameUser[] = [];

  if (cached) {
    categoryStats = await db
      .select({
        category: userGame.category,
        count: count(),
      })
      .from(userGame)
      .where(eq(userGame.gameId, cached.id))
      .groupBy(userGame.category);

    usersWithGame = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        category: userGame.category,
        rating: userGame.rating,
      })
      .from(userGame)
      .innerJoin(user, eq(userGame.userId, user.id))
      .where(eq(userGame.gameId, cached.id))
      .limit(10);
  }

  const totalUsers = categoryStats.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex gap-8 mb-10">
          <div className="w-48 flex-none">
            <div className="aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 relative">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={meta.title}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              ) : (
                <div className="size-full bg-white/5" />
              )}
            </div>
          </div>
          <div className="flex-1 py-2">
            <h1 className="text-3xl font-bold">{meta.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {meta.genres.map((g) => (
                <span
                  key={g}
                  className="text-xs text-white/40 bg-white/8 px-2.5 py-1 rounded-lg border border-white/8"
                >
                  {g}
                </span>
              ))}
              {meta.platforms.length > 0 && (
                <span className="text-xs text-white/40 bg-white/8 px-2.5 py-1 rounded-lg border border-white/8">
                  {meta.platforms.join(", ")}
                </span>
              )}
              {meta.releaseDate && (
                <span className="text-xs text-white/30">
                  {meta.releaseDate.slice(0, 4)}
                </span>
              )}
            </div>
            {meta.summary && (
              <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-xl">
                {meta.summary}
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/dashboard/games"
                className="inline-flex px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                + Add to My Library
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/3 rounded-2xl border border-white/8 p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Community Stats
            </h2>
            {totalUsers === 0 ? (
              <p className="text-white/30 text-sm">
                No one has added this game yet. Be the first!
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-white/50 mb-4">
                  <span className="text-white font-semibold">{totalUsers}</span>{" "}
                  user{totalUsers !== 1 ? "s" : ""} tracking this game
                </p>
                {CATEGORIES.map((cat) => {
                  const stat = categoryStats.find(
                    (s) => s.category === cat.id,
                  );
                  const catCount = stat?.count ?? 0;
                  const pct =
                    totalUsers > 0
                      ? Math.round((catCount / totalUsers) * 100)
                      : 0;
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="text-sm w-28 flex-none">
                        {cat.label}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40 w-16 text-right">
                        {catCount} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Users
            </h2>
            {usersWithGame.length === 0 ? (
              <p className="text-white/30 text-sm">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {usersWithGame.map((u) => {
                  const cat = CATEGORIES.find((c) => c.id === u.category);
                  return (
                    <Link
                      key={u.id}
                      href={`/u/${u.username || u.id}`}
                      className="flex items-center gap-3 hover:bg-white/5 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      {u.image ? (
                        <Image
                          src={u.image}
                          alt={u.name}
                          width={32}
                          height={32}
                          className="size-8 rounded-lg ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                      </div>
                      {cat && (
                        <span className={`text-[10px] ${cat.color}`}>
                          {cat.label}
                        </span>
                      )}
                      {u.rating && (
                        <span className="text-[10px] text-amber-400 font-bold">
                          ★ {u.rating}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
