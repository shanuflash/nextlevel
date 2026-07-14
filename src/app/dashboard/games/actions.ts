"use server";

import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { getSession } from "@/src/lib/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { fetchIGDBGame, fetchIGDBGames } from "@/src/lib/igdb";
import type { GameCategory } from "@/src/lib/constants";
import type { UserGameRow } from "@/src/lib/types";

function generateId() {
  return crypto.randomUUID();
}

interface AddGameInput {
  igdbId: number;
  category: string;
}

export async function addGame(input: AddGameInput): Promise<UserGameRow> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const { igdbId, category } = input;

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
      updatedAt: new Date(),
    };
  }

  const existingUserGame = await db.query.userGame.findFirst({
    where: and(
      eq(userGame.userId, session.user.id),
      eq(userGame.gameId, existingGame!.id)
    ),
  });

  if (existingUserGame) throw new Error("Game already in your catalog");

  const now = new Date();
  const userGameId = generateId();
  await db.insert(userGame).values({
    id: userGameId,
    userId: session.user.id,
    gameId: existingGame!.id,
    igdbId,
    category: category as GameCategory,
    startedAt: category === "playing" ? now : null,
    finishedAt: category === "finished" ? now : null,
  });

  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");

  return {
    id: userGameId,
    category,
    gameId: existingGame!.id,
    igdbId,
    title: existingGame!.title,
    slug: existingGame!.slug,
    coverImageId: existingGame!.coverImageId,
    genre: existingGame!.genres,
    updatedAt: now,
  };
}

// Set (add or change) a game's category from the public game page, keyed by
// igdbId. Updates start/finish timestamps.
export async function setGameStatus(input: {
  igdbId: number;
  category: string;
}): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const { igdbId, category } = input;

  const existingGame = await db.query.game.findFirst({
    where: eq(game.igdbId, igdbId),
  });

  if (existingGame) {
    const existingUserGame = await db.query.userGame.findFirst({
      where: and(
        eq(userGame.userId, session.user.id),
        eq(userGame.gameId, existingGame.id)
      ),
      columns: { id: true, category: true, startedAt: true, finishedAt: true },
    });

    if (existingUserGame) {
      const now = new Date();
      const timestamps: { startedAt?: Date | null; finishedAt?: Date | null } =
        {};
      if (category !== existingUserGame.category) {
        if (category === "playing" && !existingUserGame.startedAt) {
          timestamps.startedAt = now;
        }
        if (category === "finished") {
          if (!existingUserGame.startedAt) timestamps.startedAt = now;
          timestamps.finishedAt = now;
        }
      }
      await db
        .update(userGame)
        .set({ category: category as GameCategory, ...timestamps })
        .where(eq(userGame.id, existingUserGame.id));

      revalidatePath(`/game/${igdbId}`);
      revalidatePath("/dashboard/games");
      revalidatePath("/dashboard");
      return;
    }
  }

  // Not yet in catalog — add it fresh (also caches the game if needed).
  await addGame({ igdbId, category });
  revalidatePath(`/game/${igdbId}`);
}

// Remove a game from the catalog by igdbId (for the public game page).
export async function removeGameStatus(igdbId: number): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const existingGame = await db.query.game.findFirst({
    where: eq(game.igdbId, igdbId),
  });
  if (!existingGame) return;

  await db
    .delete(userGame)
    .where(
      and(
        eq(userGame.gameId, existingGame.id),
        eq(userGame.userId, session.user.id)
      )
    );

  revalidatePath(`/game/${igdbId}`);
  revalidatePath("/dashboard/games");
  revalidatePath("/dashboard");
}

interface BulkAddItem {
  igdbId: number;
  category: string;
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
        updatedAt: new Date(),
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
    row?: UserGameRow;
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
        const now = new Date();
        const userGameId = generateId();
        await db.insert(userGame).values({
          id: userGameId,
          userId: session.user.id,
          gameId: dbGame.id,
          igdbId: item.igdbId,
          category: item.category as GameCategory,
          startedAt: item.category === "playing" ? now : null,
          finishedAt: item.category === "finished" ? now : null,
        });
        results.push({
          igdbId: item.igdbId,
          title: dbGame.title,
          ok: true,
          row: {
            id: userGameId,
            category: item.category,
            gameId: dbGame.id,
            igdbId: item.igdbId,
            title: dbGame.title,
            slug: dbGame.slug,
            coverImageId: dbGame.coverImageId,
            genre: dbGame.genres,
            updatedAt: now,
          },
        });
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

  if (!userGameId) throw new Error("Missing game ID");

  const existing = await db.query.userGame.findFirst({
    where: and(
      eq(userGame.id, userGameId),
      eq(userGame.userId, session.user.id)
    ),
    columns: { category: true, startedAt: true, finishedAt: true },
  });

  const now = new Date();
  const timestamps: { startedAt?: Date | null; finishedAt?: Date | null } = {};

  if (existing && category !== existing.category) {
    if (category === "playing" && !existing.startedAt) {
      timestamps.startedAt = now;
    }
    if (category === "finished") {
      if (!existing.startedAt) timestamps.startedAt = now;
      timestamps.finishedAt = now;
    }
  }

  await db
    .update(userGame)
    .set({
      category: category as GameCategory,
      ...timestamps,
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
