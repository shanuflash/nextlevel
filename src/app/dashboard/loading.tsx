import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 sm:items-end">
        <div>
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-36 rounded-lg mt-2" />
        </div>
        <Skeleton className="size-11 rounded-full sm:h-9 sm:w-52 sm:rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-white/8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-20 rounded-xl sm:rounded-none sm:border-r sm:border-white/8 sm:last:border-r-0"
          />
        ))}
      </div>

      {/* Three cover rows: Playing, Anticipated, Released */}
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row}>
          <Skeleton className="h-3.5 w-28 rounded-md mb-4" />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-3/4 rounded-2xl ring-1 ring-white/8"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
