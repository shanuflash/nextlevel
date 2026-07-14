import Image from "next/image";
import { igdbCover, igdbImage, type IGDBGameDetail } from "@/src/lib/igdb";
import { GameAddButton } from "./game-add-button";
import { StoreLinks } from "./store-links";

// Full-bleed cinematic backdrop behind the hero (absolute; needs a relative parent).
export function HeroBackdrop({ detail }: { detail: IGDBGameDetail }) {
  const backdropId =
    detail.artworkImageIds[0] ?? detail.screenshotImageIds[0] ?? null;
  const backdropUrl = igdbImage(backdropId, "t_1080p");
  const coverUrl = igdbCover(detail.coverImageId);

  return (
    <div className="absolute inset-x-0 top-0 h-105 sm:h-120 overflow-hidden">
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt=""
          fill
          priority
          className="object-cover object-top opacity-40"
          sizes="100vw"
        />
      ) : (
        coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            className="object-cover object-top opacity-20 blur-2xl scale-110"
            sizes="100vw"
          />
        )
      )}
      {/* Soft brand glow for atmosphere */}
      <div className="absolute -top-24 right-1/4 h-96 w-175 rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute inset-0 bg-linear-to-t from-[#09090d] via-[#09090d]/80 to-[#09090d]/20" />
      <div className="absolute inset-0 bg-linear-to-r from-[#09090d] via-[#09090d]/40 to-transparent" />
    </div>
  );
}

// Cover + headline info (title, franchise, year, genres, add button, store links).
export function HeroInfo({
  detail,
  igdbId,
  isLoggedIn,
  existingCategory,
}: {
  detail: IGDBGameDetail;
  igdbId: number;
  isLoggedIn: boolean;
  existingCategory: string | null;
}) {
  const coverUrl = igdbCover(detail.coverImageId);
  const year = detail.releaseDate?.slice(0, 4);

  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5 sm:gap-8">
      <div className="w-36 sm:w-52 flex-none">
        <div className="aspect-3/4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-2xl shadow-black/50 relative">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={detail.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 144px, 208px"
            />
          ) : (
            <div className="size-full bg-white/5" />
          )}
        </div>
      </div>

      <div className="w-full flex-1 min-w-0 sm:pb-2 flex flex-col items-center sm:items-start">
        {detail.franchise && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80 mb-2">
            {detail.franchise}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold leading-[1.05] text-balance">
          {detail.title}
        </h1>

        {(year || detail.genres.length > 0) && (
          <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-sm text-white/50">
            {year && <span className="font-medium">{year}</span>}
            {year && detail.genres.length > 0 && (
              <span className="text-white/25" aria-hidden>
                •
              </span>
            )}
            {detail.genres.map((g, i) => (
              <span key={g} className="flex items-center gap-x-2">
                {i > 0 && (
                  <span className="text-white/25" aria-hidden>
                    •
                  </span>
                )}
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 w-full flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <GameAddButton
            igdbId={igdbId}
            isLoggedIn={isLoggedIn}
            existingCategory={existingCategory}
          />
        </div>

        {detail.storeLinks.length > 0 && (
          <div className="mt-4 w-full">
            <StoreLinks links={detail.storeLinks} />
          </div>
        )}
      </div>
    </div>
  );
}
