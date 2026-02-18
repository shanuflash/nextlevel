import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex gap-8 mb-10">
          <div className="w-48 flex-none">
            <Skeleton className="aspect-3/4 rounded-2xl ring-1 ring-white/10" />
          </div>
          <div className="flex-1 py-2 space-y-4">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
              <Skeleton className="h-6 w-14 rounded-lg" />
            </div>
            <div className="space-y-2 max-w-xl">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/3 rounded-2xl border border-white/8 p-6 space-y-4">
            <Skeleton className="h-3.5 w-28 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-28 rounded-md flex-none" />
                  <Skeleton className="flex-1 h-2 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-4">
            <Skeleton className="h-3.5 w-14 rounded-md" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
