import { Skeleton } from "@/components/ui/skeleton";

export default function GamesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-4 w-44 rounded-lg mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-7 rounded-full"
              style={{ width: i === 0 ? 52 : 80 }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-3/4 rounded-2xl ring-1 ring-white/8"
          />
        ))}
      </div>
    </div>
  );
}
