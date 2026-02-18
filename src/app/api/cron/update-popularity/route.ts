import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/auth";
import { game } from "@/schema/game-schema";
import { eq } from "drizzle-orm";
import { getIGDBToken, igdbHeaders } from "@/src/lib/igdb";
import { verifyCronSecret } from "@/src/lib/cron";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronSecret(req);
  if (unauthorized) return unauthorized;

  try {
    const allGames = await db
      .select({ id: game.id, igdbId: game.igdbId })
      .from(game);

    if (allGames.length === 0) {
      return NextResponse.json({ message: "No games to update", updated: 0 });
    }

    const token = await getIGDBToken();
    const headers = igdbHeaders(token);

    const igdbIds = allGames.map((g) => g.igdbId);
    const scores = new Map<number, number>();

    const chunks: number[][] = [];
    for (let i = 0; i < igdbIds.length; i += 500) {
      chunks.push(igdbIds.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const ids = chunk.join(",");
      const res = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers,
        body: `fields total_rating_count, hypes;\nwhere id = (${ids});\nlimit 500;`,
      });

      if (!res.ok) {
        console.error(
          `[cron] IGDB chunk failed: ${res.status}`,
          await res.text()
        );
        continue;
      }

      const raw: {
        id: number;
        total_rating_count?: number;
        hypes?: number;
      }[] = await res.json();

      for (const g of raw) {
        scores.set(g.id, (g.total_rating_count ?? 0) + (g.hypes ?? 0) * 10);
      }
    }

    let updated = 0;
    for (const g of allGames) {
      const score = scores.get(g.igdbId);
      if (score !== undefined) {
        await db
          .update(game)
          .set({ popularity: score })
          .where(eq(game.id, g.id));
        updated++;
      }
    }

    return NextResponse.json({
      message: `Updated ${updated} of ${allGames.length} games`,
      updated,
      total: allGames.length,
    });
  } catch (e) {
    console.error("[cron] update-popularity failed:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
