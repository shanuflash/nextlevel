"use server";

import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { getSession } from "@/src/lib/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fetchIGDBGame } from "@/src/lib/igdb";
import type { GameCategory } from "@/src/lib/constants";

function generateId() {
  return crypto.randomUUID();
}

interface AddGameInput {
  igdbId: number;
  category: string;
  rating?: number;
}

export async function addGame(input: AddGameInput) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const { igdbId, category, rating } = input;

  let existingGame = await db.query.game.findFirst({
    where: eq(game.igdbId, igdbId),
  });

  if (!existingGame) {
    const meta = await fetchIGDBGame(igdbId);
    if (!meta) throw new Error("Game not found on IGDB");

    const gameId = generateId();
    await db.insert(game).values({
      id: gameId,
      igdbId,
      title: meta.title,
      slug: meta.slug,
      coverImageId: meta.coverImageId,
      genres: meta.genres.join(", ") || null,
      platforms: meta.platforms.join(", ") || null,
      releaseDate: meta.releaseDate,
      summary: meta.summary,
    });
    existingGame = {
      id: gameId,
      igdbId,
      title: meta.title,
      slug: meta.slug,
      coverImageId: meta.coverImageId,
      genres: meta.genres.join(", ") || null,
      platforms: meta.platforms.join(", ") || null,
      releaseDate: meta.releaseDate,
      summary: meta.summary,
    };
  }

  const existingUserGame = await db.query.userGame.findFirst({
    where: and(
      eq(userGame.userId, session.user.id),
      eq(userGame.gameId, existingGame.id),
    ),
  });

  if (existingUserGame) throw new Error("Game already in your catalog");

  await db.insert(userGame).values({
    id: generateId(),
    userId: session.user.id,
    gameId: existingGame.id,
    category: category as GameCategory,
    rating: rating ?? null,
  });

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
}

export async function updateGame(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const userGameId = formData.get("userGameId") as string;
  const category = formData.get("category") as string;
  const rating = formData.get("rating") as string;

  if (!userGameId) throw new Error("Missing game ID");

  await db
    .update(userGame)
    .set({
      category: category as GameCategory,
      rating: rating ? parseFloat(rating) : null,
    })
    .where(
      and(eq(userGame.id, userGameId), eq(userGame.userId, session.user.id)),
    );

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
}

export async function removeGame(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const userGameId = formData.get("userGameId") as string;
  if (!userGameId) throw new Error("Missing game ID");

  await db
    .delete(userGame)
    .where(
      and(eq(userGame.id, userGameId), eq(userGame.userId, session.user.id)),
    );

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
}
