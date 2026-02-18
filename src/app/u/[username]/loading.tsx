import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function ProfileLoading() {
  const cols = [0, 1, 2, 3, 4];
  const itemsPerCol = 3;

  return (
    <div className="min-h-screen bg-[#09090d] text-white flex flex-col">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10 w-full flex-1">
        {/* Bento header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-2 bg-white/3 rounded-3xl border border-white/8 p-8 flex items-center gap-6">
            <Skeleton className="size-24 rounded-2xl flex-none" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-5 w-26 rounded-md" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
          </div>
          <div className="bg-white/3 rounded-3xl border border-white/8 p-8 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton
                    className={`${i < 2 ? "h-9 w-14" : "h-5 w-18"} rounded-md`}
                  />
                  <Skeleton className="h-3 w-16 rounded-md mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 rounded-full"
              style={{ width: i === 0 ? 60 : 90 }}
            />
          ))}
        </div>

        {/* Masonry grid */}
        <div className="flex gap-4">
          {cols.map((colIdx) => (
            <div
              key={colIdx}
              className={`flex-1 flex flex-col gap-4 min-w-0 ${
                colIdx >= 2
                  ? colIdx >= 3
                    ? colIdx >= 4
                      ? "hidden lg:flex"
                      : "hidden md:flex"
                    : "hidden sm:flex"
                  : ""
              }`}
            >
              {Array.from({ length: itemsPerCol }).map((_, i) => {
                const globalIdx = i * 5 + colIdx;
                const aspect = ASPECT_RATIOS[globalIdx % ASPECT_RATIOS.length];
                return (
                  <Skeleton
                    key={i}
                    className={`${aspect} rounded-2xl ring-1 ring-white/6`}
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
