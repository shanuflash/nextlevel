import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";
import { CATEGORIES } from "@/src/lib/constants";

// Mirrors u/[username]/page.tsx + ProfileView: header card, stat strip,
// a "Now playing" row (most active profiles have one), tabs + sort, grid.
// Strip cells and tabs render their real labels invisibly so their widths
// match exactly.
const ghost =
  "animate-pulse rounded-md bg-white/6 text-transparent select-none";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white flex flex-col">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 w-full flex-1">
        <div className="mb-6 space-y-3">
          {/* Identity card */}
          <div className="flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-white/8 bg-white/3 p-4 sm:flex-row sm:items-center sm:p-6">
            <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
              <Skeleton className="size-24 flex-none rounded-2xl ring-2 ring-white/10" />
              <div className="min-w-0 flex-1">
                {/* name: text-xl / sm:text-2xl */}
                <div className="flex h-7 sm:h-8 items-center">
                  <Skeleton className="h-5 sm:h-6 w-32 rounded-md" />
                </div>
                {/* @handle · Joined: text-sm */}
                <div className="flex h-5 items-center">
                  <Skeleton className="h-3.5 w-full max-w-52 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-none">
              <Skeleton className="h-10 w-27 rounded-full" />
            </div>
          </div>

          {/* Stat strip */}
          <div className="flex overflow-hidden rounded-2xl border border-white/8 bg-white/3">
            {["Games", ...CATEGORIES.map((c) => c.label)].map((label) => (
              <div
                key={label}
                className="flex-none border-r border-white/8 px-4 py-3 sm:flex-1 sm:px-5"
              >
                <div className="text-lg sm:text-xl font-bold leading-none">
                  <span className={ghost}>00</span>
                </div>
                <div className="mt-1.5 whitespace-nowrap text-[11px]">
                  <span className={ghost}>{label}</span>
                </div>
              </div>
            ))}
            <div className="flex-none px-4 py-3 sm:flex-1 sm:px-5">
              <div className="whitespace-nowrap text-sm font-semibold leading-tight">
                <span className={ghost}>Adventure</span>
              </div>
              <div className="mt-1.5 whitespace-nowrap text-[11px]">
                <span className={ghost}>Top genre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Now playing showcase */}
        <section className="mb-6">
          <div className="mb-3 flex h-4 items-center">
            <Skeleton className="h-2.5 w-24 rounded-sm" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton
                key={i}
                className="aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
              />
            ))}
          </div>
        </section>

        {/* Tabs + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-2 overflow-hidden -mx-4 px-4 pb-1 sm:mx-0 sm:px-0">
            {["All", ...CATEGORIES.map((c) => c.label)].map((label) => (
              <span
                key={label}
                className="shrink-0 min-h-11 flex items-center px-4 py-2 rounded-full border border-transparent bg-white/6 animate-pulse text-sm font-medium text-transparent select-none"
              >
                {label}
                <span className="ml-2 text-xs">00</span>
              </span>
            ))}
          </div>
          <Skeleton className="h-11 sm:w-48 sm:flex-none" />
        </div>

        {/* Catalog grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
          {Array.from({ length: 24 }, (_, i) => (
            <Skeleton
              key={i}
              className="aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
            />
          ))}
        </div>
      </div>

      <footer className="border-t border-white/6 mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="text-xs text-white/20">
            NextLevel — Your Gaming Catalog
          </span>
          <span className="text-xs text-white/20">Powered by IGDB</span>
        </div>
      </footer>
    </div>
  );
}
