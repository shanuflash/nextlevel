import type { Metadata } from "next";
import { getSession } from "@/src/lib/session";
import { db } from "@/src/lib/auth";
import { userGame, game } from "@/schema/game-schema";
import { eq } from "drizzle-orm";
import { GamesClient } from "./games-client";

export const metadata: Metadata = {
  title: "My Games",
};

export default async function GamesPage() {
  const session = await getSession();
  if (!session) return null;

  const userGames = await db
    .select({
      id: userGame.id,
      category: userGame.category,
      rating: userGame.rating,
      gameId: game.id,
      igdbId: game.igdbId,
      title: game.title,
      slug: game.slug,
      coverImageId: game.coverImageId,
      genre: game.genres,
    })
    .from(userGame)
    .innerJoin(game, eq(userGame.gameId, game.id))
    .where(eq(userGame.userId, session.user.id));

  return <GamesClient games={userGames} />;
}
