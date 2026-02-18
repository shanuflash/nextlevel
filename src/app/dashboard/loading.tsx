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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative bg-white/3 rounded-2xl border border-white/8 p-5 overflow-hidden"
          >
            <Skeleton className="h-8 w-10 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md mt-2" />
          </div>
        ))}
      </div>

      <div>
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

      <div>
        <Skeleton className="h-3.5 w-32 rounded-md mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-3/4 rounded-2xl ring-1 ring-white/8"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
