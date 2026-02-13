import type { Metadata } from "next";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { userGame, game } from "@/schema/game-schema";
import { desc, count, eq, sql } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { igdbCover } from "@/src/lib/igdb";

import { PublicNav } from "@/src/components/public-nav";

export const metadata: Metadata = {
  title: "Explore",
  description: "Popular games and user catalogs on NextLevel.",
};

export default async function ExplorePage() {
  const usersWithGames = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      gameCount: count(userGame.id),
    })
    .from(user)
    .leftJoin(userGame, eq(user.id, userGame.userId))
    .groupBy(user.id)
    .having(sql`count(${userGame.id}) > 0`)
    .orderBy(desc(count(userGame.id)))
    .limit(20);

  const popularGames = await db
    .select({
      gameId: game.id,
      igdbId: game.igdbId,
      title: game.title,
      coverImageId: game.coverImageId,
      userCount: count(userGame.id),
    })
    .from(game)
    .innerJoin(userGame, eq(game.id, userGame.gameId))
    .groupBy(game.id)
    .orderBy(desc(count(userGame.id)))
    .limit(12);

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        <div>
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-white/40 text-sm mt-1">
            Popular games and user catalogs.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Popular Games</h2>
          {popularGames.length === 0 ? (
            <div className="bg-white/3 rounded-2xl border border-white/8 p-12 text-center">
              <p className="text-white/30 text-sm">
                No games tracked yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularGames.map((g) => {
                const cover = igdbCover(g.coverImageId);
                return (
                  <Link
                    key={g.gameId}
                    href={`/game/${g.igdbId}`}
                    className="group"
                  >
                    <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/8 transition-all group-hover:ring-white/20">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={g.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="size-full bg-white/5" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 pt-8">
                        <p className="text-xs font-semibold leading-tight line-clamp-2">
                          {g.title}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          {g.userCount} user{g.userCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          {usersWithGames.length === 0 ? (
            <div className="bg-white/3 rounded-2xl border border-white/8 p-12 text-center">
              <p className="text-white/30 text-sm">
                No users with game catalogs yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {usersWithGames.map((u) => (
                <Link
                  key={u.id}
                  href={`/u/${u.username || u.id}`}
                  className="bg-white/3 rounded-2xl border border-white/8 p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  {u.image ? (
                    <Image
                      src={u.image}
                      alt={u.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-xl ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                      {u.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    {u.username && (
                      <p className="text-xs text-white/30">@{u.username}</p>
                    )}
                    {u.bio && (
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
                        {u.bio}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-none">
                    <div className="text-sm font-bold text-primary">
                      {u.gameCount}
                    </div>
                    <div className="text-[10px] text-white/30">games</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
