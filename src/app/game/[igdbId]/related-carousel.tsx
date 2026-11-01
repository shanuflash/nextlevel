import { GameCard } from "@/src/components/game-card";
import type { IGDBRelatedGame } from "@/src/lib/igdb";

// "The Witcher 3: Wild Hunt - Hearts of Stone" -> "Hearts of Stone", so add-on
// cards aren't all truncated to the same prefix.
function withoutPrefix(title: string, prefix?: string) {
  if (!prefix || !title.startsWith(prefix)) return title;
  const rest = title
    .slice(prefix.length)
    .replace(/^\s*[-–—:|]\s*/, "")
    .trim();
  return rest || title;
}

export function RelatedCarousel({
  title,
  games,
  stripPrefix,
}: {
  title: string;
  games: IGDBRelatedGame[];
  /** Base game title to drop from the front of each add-on's name. */
  stripPrefix?: string;
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
              title={withoutPrefix(g.title, stripPrefix)}
              coverImageId={g.coverImageId}
              coverSize="t_cover_big"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
