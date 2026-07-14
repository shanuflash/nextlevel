import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-36 rounded-lg mt-2" />
        </div>
        <Skeleton className="h-9 w-52 rounded-lg" />
      </div>

      {/* Lean stat bar */}
      <Skeleton className="h-18.5 rounded-2xl" />

      {/* Three cover rows: Playing, Anticipated, Released */}
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row}>
          <Skeleton className="h-3.5 w-28 rounded-md mb-4" />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
