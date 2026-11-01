import Link from "next/link";
import { GameCard } from "@/src/components/game-card";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  BROWSE_GENRES,
  BROWSE_PLATFORMS,
  getComingSoon,
  getNewReleases,
  getTopByFilter,
  getTopRated,
  type BrowseGame,
  type BrowseOption,
} from "@/src/lib/igdb-browse";
import { ScrollRow } from "./scroll-row";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
        {title}
      </h2>
      <div className="flex-1 h-px bg-white/8" />
      {action}
    </div>
  );
}

// "Oct 29", with the year only when it isn't this one. UTC so the label
// matches IGDB's date regardless of server timezone.
function formatDate(unix: number | null) {
  if (!unix) return undefined;
  const d = new Date(unix * 1000);
  const sameYear = d.getUTCFullYear() === new Date().getUTCFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  });
}

function year(unix: number | null) {
  return unix ? String(new Date(unix * 1000).getUTCFullYear()) : undefined;
}

/* ---------------------------- Chips ---------------------------- */

function chipHref(genre: string | null, platform: string | null) {
  const params = new URLSearchParams();
  if (genre) params.set("genre", genre);
  if (platform) params.set("platform", platform);
  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`flex-none rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-primary/50 bg-primary/15 text-white"
          : "border-white/10 bg-white/3 text-white/55 hover:bg-white/6 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

const chipRow =
  "-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** Genre + platform chips. Each toggles its own param and keeps the other. */
export function BrowseChips({
  genre,
  platform,
}: {
  genre: BrowseOption | null;
  platform: BrowseOption | null;
}) {
  return (
    <section className="mt-8 space-y-2.5">
      <SectionHeader
        title="Browse"
        action={
          (genre || platform) && (
            <Link
              href="/explore"
              scroll={false}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Clear
            </Link>
          )
        }
      />
      <div className={chipRow}>
        {BROWSE_GENRES.map((g) => {
          const active = genre?.slug === g.slug;
          return (
            <Chip
              key={g.slug}
              href={chipHref(active ? null : g.slug, platform?.slug ?? null)}
              active={active}
            >
              {g.label}
            </Chip>
          );
        })}
      </div>
      <div className={chipRow}>
        {BROWSE_PLATFORMS.map((p) => {
          const active = platform?.slug === p.slug;
          return (
            <Chip
              key={p.slug}
              href={chipHref(genre?.slug ?? null, active ? null : p.slug)}
              active={active}
            >
              {p.label}
            </Chip>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------- IGDB sections ------------------------ */

function RowItem({
  game,
  subtitle,
  badge,
}: {
  game: BrowseGame;
  subtitle?: string;
  badge?: { text: string; className: string };
}) {
  return (
    <div className="w-[30%] sm:w-36 lg:w-44 flex-none snap-start">
      <GameCard
        href={`/game/${game.igdbId}`}
        title={game.title}
        coverImageId={game.coverImageId}
        subtitle={subtitle}
        badge={badge}
      />
    </div>
  );
}

// A failed IGDB call hides its section rather than breaking the page.
async function load(name: string, fn: () => Promise<BrowseGame[]>) {
  try {
    return await fn();
  } catch (e) {
    console.error(`Explore ${name} failed:`, e);
    return [];
  }
}

export async function NewReleases() {
  const games = await load("new releases", getNewReleases);
  if (games.length === 0) return null;
  return (
    <ScrollRow title="New releases">
      {games.map((g) => (
        <RowItem key={g.igdbId} game={g} subtitle={formatDate(g.releaseDate)} />
      ))}
    </ScrollRow>
  );
}

export async function ComingSoon() {
  const games = await load("coming soon", getComingSoon);
  if (games.length === 0) return null;
  return (
    <ScrollRow title="Coming soon">
      {games.map((g) => (
        <RowItem key={g.igdbId} game={g} subtitle={formatDate(g.releaseDate)} />
      ))}
    </ScrollRow>
  );
}

export async function TopRated() {
  const games = await load("top rated", getTopRated);
  if (games.length === 0) return null;
  return (
    <ScrollRow title="Top rated">
      {games.map((g) => (
        <RowItem
          key={g.igdbId}
          game={g}
          subtitle={year(g.releaseDate)}
          badge={
            g.totalRating
              ? {
                  text: String(Math.round(g.totalRating)),
                  className: "bg-black/60 text-white/90",
                }
              : undefined
          }
        />
      ))}
    </ScrollRow>
  );
}

export async function FilteredGames({
  genre,
  platform,
}: {
  genre: BrowseOption | null;
  platform: BrowseOption | null;
}) {
  const games = await load("filtered", () => getTopByFilter(genre, platform));
  const title = genre
    ? `Top ${genre.label} games${platform ? ` on ${platform.label}` : ""}`
    : `Top ${platform?.label} games`;

  return (
    <section className="mt-8">
      <SectionHeader title={title} />
      {games.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {games.map((g) => (
            <GameCard
              key={g.igdbId}
              href={`/game/${g.igdbId}`}
              title={g.title}
              coverImageId={g.coverImageId}
              subtitle={year(g.releaseDate)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/3 rounded-2xl border border-white/8 p-12 text-center">
          <p className="text-white/30 text-sm">
            Couldn&apos;t load games right now. Try again in a moment.
          </p>
        </div>
      )}
    </section>
  );
}

/* -------------------------- Skeletons -------------------------- */
// Each skeleton mirrors its real section's wrappers and line heights so
// nothing shifts when IGDB data streams in.

/** SectionHeader footprint: 16px title line, divider, optional row arrows. */
function HeaderSkeleton({
  width,
  arrows = false,
  className = "mb-4",
}: {
  width: string;
  arrows?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex h-4 items-center ${arrows ? "sm:h-7" : ""}`}>
        <Skeleton className={`h-2.5 rounded-sm ${width}`} />
      </div>
      <div className="flex-1 h-px bg-white/8" />
      {arrows && (
        <div className="hidden sm:flex gap-1.5">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-7 rounded-full" />
        </div>
      )}
    </div>
  );
}

/** Chips render their real labels invisibly, so widths and wrapping match. */
export function BrowseChipsSkeleton() {
  const chip =
    "flex-none animate-pulse rounded-full border border-transparent bg-white/6 px-3.5 py-1.5 text-[13px] font-medium text-transparent select-none";
  return (
    <section className="mt-8 space-y-2.5" aria-hidden>
      <HeaderSkeleton width="w-14" />
      <div className={chipRow}>
        {BROWSE_GENRES.map((g) => (
          <span key={g.slug} className={chip}>
            {g.label}
          </span>
        ))}
      </div>
      <div className={chipRow}>
        {BROWSE_PLATFORMS.map((p) => (
          <span key={p.slug} className={chip}>
            {p.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function RowSkeleton() {
  return (
    <section className="mt-8">
      <HeaderSkeleton width="w-24" arrows className="mb-3" />
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 sm:gap-3 overflow-hidden pt-1 pb-2">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton
            key={i}
            className="w-[30%] sm:w-36 lg:w-44 flex-none aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
          />
        ))}
      </div>
    </section>
  );
}

export function GridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <section className="mt-8">
      <HeaderSkeleton width="w-36" />
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {Array.from({ length: count }, (_, i) => (
          <Skeleton
            key={i}
            className="aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
          />
        ))}
      </div>
    </section>
  );
}

/** Tastemaker cards as rendered in page.tsx (4 curators, 6 covers each). */
export function TastemakersSkeleton() {
  return (
    <section className="mt-8">
      <HeaderSkeleton width="w-28" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/8 bg-white/3"
          >
            <div className="flex items-center gap-3 p-4 pb-3">
              <Skeleton className="size-12 flex-none rounded-xl" />
              <div className="flex-1 min-w-0">
                {/* name: text-[15px] */}
                <div className="flex h-[22.5px] items-center">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                </div>
                {/* @handle · stats: text-xs */}
                <div className="flex h-4 items-center">
                  <Skeleton className="h-2.5 w-44 rounded-sm" />
                </div>
              </div>
              <div className="flex-none flex flex-col items-end">
                <Skeleton className="h-4 w-8 rounded-sm" />
                <div className="mt-0.5 flex h-[15px] items-center">
                  <Skeleton className="h-2 w-8 rounded-sm" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 px-3.5 pb-3.5 [&>*:nth-child(n+5)]:hidden sm:[&>*:nth-child(n+5)]:block">
              {Array.from({ length: 6 }, (_, j) => (
                <Skeleton
                  key={j}
                  className="aspect-3/4 rounded-lg ring-1 ring-white/8"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
