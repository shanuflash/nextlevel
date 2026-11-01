import { Skeleton } from "@/src/components/ui/skeleton";

// Mirrors dashboard/page.tsx: header row, stat strip, then the three cover
// rows a typical library shows (Recently added, Anticipated, Released).
function CoverRow({ titleWidth }: { titleWidth: string }) {
  return (
    <div>
      <div className="mb-4 flex h-5 items-center">
        <Skeleton className={`h-3.5 rounded-md ${titleWidth}`} />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton
            key={i}
            className="aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-7 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* h1: text-xl / sm:text-3xl */}
        <div className="flex h-7 sm:h-9 items-center">
          <Skeleton className="h-5 sm:h-7 w-60 sm:w-80 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-11 flex-none rounded-full sm:h-8.5 sm:w-37" />
          <Skeleton className="h-11 flex-1 rounded-full sm:w-32 sm:flex-none" />
        </div>
      </div>

      {/* Stat strip: same tile padding as DashboardStats */}
      <div className="flex overflow-hidden rounded-2xl border border-white/8 bg-white/3">
        {[88, 72, 64, 84, 64, 64].map((w, i) => (
          <div
            key={i}
            className="flex-none border-r border-white/8 last:border-r-0 px-4 py-3.5 sm:flex-1 sm:px-5 sm:py-4"
          >
            <Skeleton className="h-6 w-8 rounded-md" />
            <div className="mt-2 flex h-[16.5px] items-center">
              <Skeleton
                className="h-2.5 rounded-sm"
                style={{ width: `${w}px` }}
              />
            </div>
          </div>
        ))}
      </div>

      <CoverRow titleWidth="w-32" />
      <CoverRow titleWidth="w-36" />
      <CoverRow titleWidth="w-36" />
    </div>
  );
}
