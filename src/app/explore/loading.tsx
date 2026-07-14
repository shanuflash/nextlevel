import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div>
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg mt-2" />
        </div>

        {/* Tastemakers */}
        <section className="mt-8">
          <Skeleton className="h-3 w-28 rounded-md mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-white/3"
              >
                <div className="flex items-center gap-3 p-4 pb-3">
                  <Skeleton className="size-12 rounded-xl flex-none" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded-md" />
                </div>
                <div className="px-4 pb-3 space-y-1.5">
                  <Skeleton className="h-3 w-full rounded-md" />
                  <Skeleton className="h-3 w-2/3 rounded-md" />
                </div>
                <div className="grid grid-cols-6 gap-1.5 px-3.5 pb-3.5">
                  {Array.from({ length: 6 }).map((_, j) => (
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

        {/* Worth adding */}
        <section className="mt-8">
          <Skeleton className="h-3 w-28 rounded-md mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-3/4 rounded-2xl ring-1 ring-white/8"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
