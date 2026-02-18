import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-xl space-y-10">
      <div>
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-4 w-52 rounded-lg mt-2" />
      </div>

      {/* Profile section */}
      <section>
        <Skeleton className="h-3 w-14 rounded-md mb-4" />
        <div className="bg-white/3 rounded-2xl border border-white/6 divide-y divide-white/6">
          <div className="p-5 flex items-center gap-4">
            <Skeleton className="size-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md mt-1.5" />
            </div>
          </div>
          <div className="p-5">
            <Skeleton className="h-3 w-20 rounded-md mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="p-5">
            <Skeleton className="h-3 w-16 rounded-md mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="p-5">
            <Skeleton className="h-3 w-8 rounded-md mb-2" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="p-5 flex items-center justify-end">
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Security section */}
      <section>
        <Skeleton className="h-3 w-16 rounded-md mb-4" />
        <div className="bg-white/3 rounded-2xl border border-white/6 divide-y divide-white/6">
          <div className="p-5">
            <Skeleton className="h-3 w-28 rounded-md mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="p-5">
            <Skeleton className="h-3 w-28 rounded-md mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="p-5 flex items-center justify-end">
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
