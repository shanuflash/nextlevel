import { Skeleton } from "@/src/components/ui/skeleton";

// Mirrors games-client.tsx: header, search + status chips, filter selects,
// then the cover grid.
export default function GamesLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* h1: text-2xl / sm:text-3xl */}
          <div className="flex h-8 sm:h-9 items-center">
            <Skeleton className="h-6 sm:h-7 w-36 rounded-lg" />
          </div>
          {/* count: text-sm, mt-1 */}
          <div className="mt-1 flex h-5 items-center">
            <Skeleton className="h-3.5 w-40 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-11 rounded-full sm:w-32" />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Skeleton className="h-10 lg:w-72 lg:flex-none" />
          <div className="hidden sm:flex flex-wrap gap-2 lg:ml-2">
            {[64, 100, 88, 116, 92, 96].map((w, i) => (
              <Skeleton
                key={i}
                className="h-10 rounded-full"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Skeleton className="h-10 sm:hidden" />
          <Skeleton className="h-10 sm:w-40" />
          <Skeleton className="h-10 sm:w-40" />
          <Skeleton className="h-10 sm:w-32" />
          <Skeleton className="col-span-2 h-10 sm:col-span-1 sm:ml-auto sm:w-56" />
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton
            key={i}
            className="aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
          />
        ))}
      </div>
    </div>
  );
}
