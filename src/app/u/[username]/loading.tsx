import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";

const ASPECT_RATIOS = [
  "aspect-[3/4]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-[3/5]",
  "aspect-[3/4]",
];

// Column visibility mirrors useColumnCount in profile-view:
// <640px → 3 cols, ≥640 → 4, ≥768 → 5, ≥1024 → 6.
const COL_VISIBILITY = [
  "",
  "",
  "",
  "hidden sm:flex",
  "hidden md:flex",
  "hidden lg:flex",
];

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white flex flex-col">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-8 w-full flex-1">
        {/* Identity + headline stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="col-span-2 flex items-center gap-5 rounded-3xl border border-white/8 bg-white/3 p-6">
            <Skeleton className="size-24 rounded-2xl flex-none" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-56 rounded-md" />
            </div>
          </div>
          <Skeleton className="rounded-3xl h-33" />
          <Skeleton className="rounded-3xl h-33" />
        </div>

        {/* Category strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="rounded-2xl h-19" />
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 rounded-full"
              style={{ width: i === 0 ? 60 : 100 }}
            />
          ))}
        </div>

        {/* Masonry grid */}
        <div className="flex gap-3 sm:gap-4">
          {[0, 1, 2, 3, 4, 5].map((colIdx) => (
            <div
              key={colIdx}
              className={`flex-1 flex flex-col gap-3 sm:gap-4 min-w-0 ${COL_VISIBILITY[colIdx]}`}
            >
              {Array.from({ length: 3 }).map((_, i) => {
                const globalIdx = i * 6 + colIdx;
                const aspect = ASPECT_RATIOS[globalIdx % ASPECT_RATIOS.length];
                return (
                  <Skeleton
                    key={i}
                    className={`${aspect} rounded-2xl ring-1 ring-white/8`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/6 mt-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-white/20">
            NextLevel — Your Gaming Catalog
          </span>
          <a
            href="https://www.igdb.com/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Powered by IGDB
          </a>
        </div>
      </footer>
    </div>
  );
}
