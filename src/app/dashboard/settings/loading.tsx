import { Skeleton } from "@/src/components/ui/skeleton";

// Mirrors settings-client.tsx with the Profile section open (the default):
// header, sidebar tabs, the profile form card and the privacy card.
function Field({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-5">
      {/* label: text-xs, mb-2 */}
      <div className="mb-2 flex h-4 items-center">
        <Skeleton className="h-2.5 w-20 rounded-sm" />
      </div>
      {children}
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <div className="flex h-8 sm:h-9 items-center">
          <Skeleton className="h-6 sm:h-7 w-28 rounded-lg" />
        </div>
        <div className="mt-1 flex h-5 items-center">
          <Skeleton className="h-3.5 w-56 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-10">
        <div className="flex md:flex-col gap-1 -mx-4 px-4 pb-1 md:mx-0 md:px-0">
          {[99, 110, 114].map((w, i) => (
            <Skeleton
              key={i}
              className="h-11 shrink-0 rounded-xl md:w-full!"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        <div className="min-w-0 max-w-xl">
          <div className="mb-5">
            {/* h2: text-lg */}
            <div className="flex h-7 items-center">
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="mt-0.5 flex h-5 items-center">
              <Skeleton className="h-3.5 w-52 rounded-md" />
            </div>
          </div>

          <div className="bg-white/3 rounded-2xl border border-white/8 divide-y divide-white/8">
            <Field>
              <Skeleton className="h-10.5 w-full" />
            </Field>
            <Field>
              <Skeleton className="h-10.5 w-full" />
              {/* hint wraps to two lines on phones */}
              <div className="mt-1.5 flex h-[16.5px] items-center">
                <Skeleton className="h-2.5 w-full sm:w-64 rounded-sm" />
              </div>
              <div className="flex h-[16.5px] items-center sm:hidden">
                <Skeleton className="h-2.5 w-24 rounded-sm" />
              </div>
              <div className="mt-1 flex h-[16.5px] items-center">
                <Skeleton className="h-2.5 w-40 rounded-sm" />
              </div>
            </Field>
            <Field>
              <Skeleton className="h-22.25 w-full" />
            </Field>
            <div className="rounded-b-2xl p-4 sm:p-5 flex items-center justify-end">
              <Skeleton className="h-9 w-16" />
            </div>
          </div>

          {/* Privacy card */}
          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <div className="flex h-5 items-center">
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
              <div className="mt-0.5 space-y-0 sm:space-y-0">
                <div className="flex h-[16.5px] items-center">
                  <Skeleton className="h-2.5 w-full max-w-sm rounded-sm" />
                </div>
                <div className="flex h-[16.5px] items-center sm:hidden">
                  <Skeleton className="h-2.5 w-24 rounded-sm" />
                </div>
              </div>
            </div>
            <Skeleton className="h-6 w-10 shrink-0 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
