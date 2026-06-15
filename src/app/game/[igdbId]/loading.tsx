import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-105 sm:h-120 bg-white/3" />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 sm:pt-40">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div className="w-40 sm:w-52 flex-none mx-auto sm:mx-0">
              <Skeleton className="aspect-3/4 rounded-2xl ring-1 ring-white/10" />
            </div>
            <div className="flex-1 space-y-4 sm:pb-2">
              <Skeleton className="h-10 w-72 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-md" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-14 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-12 w-24 rounded-xl" />
                <Skeleton className="h-12 w-24 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-20 rounded-md" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/3 rounded-2xl border border-white/8 p-5 space-y-4">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-24 rounded-md flex-none" />
                <Skeleton className="flex-1 h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
