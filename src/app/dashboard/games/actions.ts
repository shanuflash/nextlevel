"use server";

import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { getSession } from "@/src/lib/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fetchIGDBGame, fetchIGDBGames } from "@/src/lib/igdb";
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
      popularity: meta.popularity,
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
      popularity: meta.popularity,
      isFeaturedAnticipated: false,
      isFeaturedReleased: false,
    };
  }

  const existingUserGame = await db.query.userGame.findFirst({
    where: and(
      eq(userGame.userId, session.user.id),
      eq(userGame.gameId, existingGame!.id)
    ),
  });

  if (existingUserGame) throw new Error("Game already in your catalog");

  await db.insert(userGame).values({
    id: generateId(),
    userId: session.user.id,
    gameId: existingGame!.id,
    igdbId,
    category: category as GameCategory,
    rating: rating ?? null,
  });

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
}

interface BulkAddItem {
  igdbId: number;
  category: string;
  rating?: number;
}

export async function bulkAddGames(items: BulkAddItem[]) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const igdbIds = items.map((i) => i.igdbId);

  const existingGames = await db.query.game.findMany({
    where: (fields, { inArray }) => inArray(fields.igdbId, igdbIds),
  });

  const existingMap = new Map(existingGames.map((g) => [g.igdbId, g]));
  const missingIds = igdbIds.filter((id) => !existingMap.has(id));

  const igdbMap =
    missingIds.length > 0 ? await fetchIGDBGames(missingIds) : new Map();

  await Promise.all(
    missingIds.map(async (igdbId) => {
      const meta = igdbMap.get(igdbId);
      if (!meta) return;
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
        popularity: meta.popularity,
      });
      existingMap.set(igdbId, {
        id: gameId,
        igdbId,
        title: meta.title,
        slug: meta.slug,
        coverImageId: meta.coverImageId,
        genres: meta.genres.join(", ") || null,
        platforms: meta.platforms.join(", ") || null,
        releaseDate: meta.releaseDate,
        summary: meta.summary,
        popularity: meta.popularity,
        isFeaturedAnticipated: false,
        isFeaturedReleased: false,
      });
    })
  );

  const gameIds = [...existingMap.values()].map((g) => g.id);
  const existingUserGames =
    gameIds.length > 0
      ? await db.query.userGame.findMany({
          where: (fields, { and: a, eq: e, inArray }) =>
            a(
              e(fields.userId, session.user.id),
              inArray(fields.gameId, gameIds)
            ),
        })
      : [];
  const userGameSet = new Set(existingUserGames.map((ug) => ug.gameId));

  const results: {
    igdbId: number;
    title: string;
    ok: boolean;
    error?: string;
  }[] = [];

  await Promise.all(
    items.map(async (item) => {
      const dbGame = existingMap.get(item.igdbId);
      if (!dbGame) {
        results.push({
          igdbId: item.igdbId,
          title: `ID ${item.igdbId}`,
          ok: false,
          error: "Not found on IGDB",
        });
        return;
      }
      if (userGameSet.has(dbGame.id)) {
        results.push({
          igdbId: item.igdbId,
          title: dbGame.title,
          ok: false,
          error: "Already in catalog",
        });
        return;
      }
      try {
        await db.insert(userGame).values({
          id: generateId(),
          userId: session.user.id,
          gameId: dbGame.id,
          igdbId: item.igdbId,
          category: item.category as GameCategory,
          rating: item.rating ?? null,
        });
        results.push({ igdbId: item.igdbId, title: dbGame.title, ok: true });
      } catch {
        results.push({
          igdbId: item.igdbId,
          title: dbGame.title,
          ok: false,
          error: "Failed to add",
        });
      }
    })
  );

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
  return results;
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
      and(eq(userGame.id, userGameId), eq(userGame.userId, session.user.id))
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
      and(eq(userGame.id, userGameId), eq(userGame.userId, session.user.id))
    );

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
}
