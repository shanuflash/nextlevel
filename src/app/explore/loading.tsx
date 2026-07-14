import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div>
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-lg mt-2" />
        </div>

        <section>
          <Skeleton className="h-3.5 w-32 rounded-md mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-3/4 rounded-2xl ring-1 ring-white/8"
              />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-3.5 w-16 rounded-md mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/3 rounded-2xl border border-white/8 p-5 flex items-center gap-4"
              >
                <Skeleton className="size-10 rounded-full flex-none" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-5 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
