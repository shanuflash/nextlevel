import type { Metadata } from "next";
import { db } from "@/src/lib/auth";
import { game, userGame } from "@/schema/game-schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { fetchIGDBGame, fetchIGDBGameDetail, igdbImage } from "@/src/lib/igdb";
import { getSession } from "@/src/lib/session";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { PublicNav } from "@/src/components/public-nav";
import { ScrollReveal } from "@/src/components/scroll-reveal";
import { HeroBackdrop, HeroInfo } from "./game-hero";
import { ExpandableText } from "./expandable-text";
import { MediaGallery } from "./media-gallery";
import { TrailerPlayer } from "./trailer-player";
import { DetailsGrid } from "./details-grid";
import { RelatedCarousel } from "./related-carousel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ igdbId: string }>;
}): Promise<Metadata> {
  const { igdbId: igdbIdStr } = await params;
  const igdbId = parseInt(igdbIdStr, 10);
  if (isNaN(igdbId)) return { title: "Game Not Found" };

  const cached = await db.query.game.findFirst({
    where: eq(game.igdbId, igdbId),
  });

  const title = cached?.title ?? "Game";
  const description = cached?.summary
    ? cached.summary.slice(0, 160)
    : `View ${title} on NextLevel.`;
  const cover = cached?.coverImageId
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${cached.coverImageId}.jpg`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: cover ? [{ url: cover, width: 264, height: 374 }] : undefined,
    },
  };
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

  // Keep the thin game-table cache warm for lists / metadata (7-day refresh).
  const STALE_MS = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const isStale =
    cached &&
    (!cached.updatedAt ||
      now.getTime() - new Date(cached.updatedAt).getTime() > STALE_MS);

  if (isStale) {
    fetchIGDBGame(igdbId)
      .then(async (fresh) => {
        if (!fresh) return;
        await db
          .update(game)
          .set({
            title: fresh.title,
            slug: fresh.slug,
            coverImageId: fresh.coverImageId,
            genres: fresh.genres.join(", ") || null,
            platforms: fresh.platforms.join(", ") || null,
            releaseDate: fresh.releaseDate,
            summary: fresh.summary,
            popularity: fresh.popularity,
          })
          .where(eq(game.id, cached.id));
      })
      .catch(() => {});
  }

  // Rich detail, cached live from IGDB (24h via unstable_cache).
  const detail = await fetchIGDBGameDetail(igdbId);

  // Hard fail only when we have neither rich data nor a thin cache row.
  if (!detail && !cached) notFound();

  const session = await getSession();

  let existingCategory: string | null = null;

  if (cached && session) {
    const existing = await db.query.userGame.findFirst({
      where: and(
        eq(userGame.userId, session.user.id),
        eq(userGame.gameId, cached.id)
      ),
      columns: { category: true },
    });
    existingCategory = existing?.category ?? null;
  }

  // Graceful fallback: IGDB rich fetch failed but we have thin cache.
  if (!detail && cached) {
    return (
      <div className="min-h-screen bg-[#09090d] text-white">
        <PublicNav />
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-10">
            <div className="w-40 sm:w-52 flex-none mx-auto sm:mx-0">
              <div className="aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 relative">
                {cached.coverImageId && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      igdbImage(cached.coverImageId, "t_cover_big_2x") ?? undefined
                    }
                    alt={cached.title}
                    className="size-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{cached.title}</h1>
              {cached.summary && (
                <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-xl">
                  {cached.summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) notFound();

  const aboutText = detail.summary ?? detail.storyline;
  const hasMedia =
    detail.videos.length > 0 || detail.screenshotImageIds.length > 0;
  const hasRelated =
    detail.similarGames.length > 0 ||
    detail.dlcs.length > 0 ||
    detail.expansions.length > 0;

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="relative">
        <HeroBackdrop detail={detail} />

        <main className="relative mx-auto max-w-6xl px-6 pt-16 sm:pt-40 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 lg:items-start">
            {/* Left: hero info, then the page content */}
            <div className="lg:col-span-2 min-w-0">
              <HeroInfo
                detail={detail}
                igdbId={igdbId}
                isLoggedIn={!!session}
                existingCategory={existingCategory}
              />

              <div className="mt-12 space-y-12">
                {aboutText && (
              <ScrollReveal>
                <section>
                  <h2 className="text-lg font-semibold mb-3">About</h2>
                  <ExpandableText text={aboutText} />
                  {detail.summary && detail.storyline && (
                    <details className="group mt-4 rounded-xl border border-white/8 bg-white/3">
                      <summary className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white/70 cursor-pointer hover:text-white transition-colors list-none select-none">
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          className="size-4 text-white/40 transition-transform group-open:rotate-180"
                          strokeWidth={2}
                        />
                        Show storyline
                      </summary>
                      <p className="text-white/55 text-sm leading-relaxed whitespace-pre-line px-4 pb-4">
                        {detail.storyline}
                      </p>
                    </details>
                  )}
                </section>
              </ScrollReveal>
            )}

            {hasMedia && (
              <ScrollReveal>
                <section id="media" className="space-y-6 scroll-mt-6">
                  <h2 className="text-lg font-semibold">Media</h2>
                  <TrailerPlayer videos={detail.videos} />
                  <MediaGallery imageIds={detail.screenshotImageIds} />
                </section>
              </ScrollReveal>
            )}

            {hasRelated && (
              <ScrollReveal>
                <div className="space-y-10">
                  <RelatedCarousel
                    title="Expansions"
                    games={detail.expansions}
                  />
                  <RelatedCarousel title="DLC & Add-ons" games={detail.dlcs} />
                  <RelatedCarousel
                    title="Similar games"
                    games={detail.similarGames}
                  />
                </div>
              </ScrollReveal>
            )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <DetailsGrid detail={detail} />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
