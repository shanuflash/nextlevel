import { Skeleton } from "@/src/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-4 w-52 rounded-lg mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-10">
        {/* Sidebar nav */}
        <div className="flex md:flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full md:w-full rounded-xl" />
          ))}
        </div>

        {/* Panel */}
        <div className="min-w-0 max-w-xl">
          <div className="mb-5 space-y-2">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-4 w-56 rounded-md" />
          </div>
          <div className="bg-white/3 rounded-2xl border border-white/8 divide-y divide-white/8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5">
                <Skeleton className="h-3 w-20 rounded-md mb-2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
            <div className="p-5 flex items-center justify-end">
              <Skeleton className="h-9 w-16 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
