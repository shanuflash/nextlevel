import { GameCard } from "@/src/components/game-card";
import type { IGDBRelatedGame } from "@/src/lib/igdb";

export function RelatedCarousel({
  title,
  games,
}: {
  title: string;
  games: IGDBRelatedGame[];
}) {
  if (games.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto snap-x pt-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((g) => (
          <div key={g.igdbId} className="w-28 sm:w-32 flex-none snap-start">
            <GameCard
              href={`/game/${g.igdbId}`}
              title={g.title}
              coverImageId={g.coverImageId}
              coverSize="t_cover_big"
              sizes="128px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
