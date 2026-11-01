import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";

// Mirrors page.tsx + HeroInfo + DetailsGrid wrapper-for-wrapper so nothing
// shifts when the real page streams in. Block heights match the line heights
// of the text they stand in for.
export default function GameLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="relative">
        {/* HeroBackdrop footprint */}
        <div className="absolute inset-x-0 top-0 h-105 sm:h-120 overflow-hidden mask-[linear-gradient(to_bottom,black_55%,transparent)]">
          <div className="absolute inset-0 bg-white/3" />
        </div>

        <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-40 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 lg:items-start">
            <div className="lg:col-span-2 min-w-0">
              {/* HeroInfo */}
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5 sm:gap-8">
                <div className="w-36 sm:w-52 flex-none">
                  <Skeleton className="aspect-3/4 rounded-2xl ring-1 ring-white/10" />
                </div>

                <div className="w-full flex-1 min-w-0 sm:pb-2 flex flex-col items-center sm:items-start">
                  {/* franchise (text-[11px], mb-2) */}
                  <Skeleton className="h-3 my-[2px] mb-2.5 w-24 rounded-md" />
                  {/* title (text-3xl/4xl, leading-[1.05]) */}
                  <div className="flex w-full flex-col items-center gap-[7.5px] py-[3.75px] sm:items-start sm:gap-0 sm:py-0">
                    <Skeleton className="h-6 w-full sm:h-9.5 sm:w-96 rounded-lg" />
                    <Skeleton className="h-6 w-3/5 sm:hidden rounded-lg" />
                  </div>
                  {/* year · genres (text-sm, mt-2.5) */}
                  <Skeleton className="mt-2.5 h-5 w-56 rounded-md" />
                  {/* status button (mt-5, py-2.5 + text-sm) */}
                  <div className="mt-5 flex">
                    <Skeleton className="h-10.5 w-44 rounded-full" />
                  </div>
                  {/* store links (mt-4): icon circles on phones, pills on sm+ */}
                  <div className="mt-4 w-full space-y-4 sm:space-y-3">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-2">
                      {[88, 112, 72, 88, 108, 92].map((w, i) => (
                        <Skeleton
                          key={i}
                          className="size-11 rounded-full sm:h-9.5 sm:w-(--w)"
                          style={{ "--w": `${w}px` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-x-4">
                      <Skeleton className="h-4.5 w-20 rounded-md" />
                      <div className="flex items-center gap-3.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Skeleton key={i} className="size-5 rounded-md" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-12">
                {/* About: h2 (text-lg, mb-3) + clamped text-sm/relaxed lines */}
                <section>
                  <div className="mb-3 flex h-7 items-center">
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  {["w-full", "w-full", "w-full", "w-11/12", "w-3/5"].map(
                    (w, i) => (
                      <div key={i} className="flex h-[22.75px] items-center">
                        <Skeleton className={`h-3.5 rounded-md ${w}`} />
                      </div>
                    )
                  )}
                  <div className="mt-2 flex h-5 items-center">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="mt-4 h-11.5 w-full rounded-xl" />
                </section>

                {/* Media: h2, trailers row, screenshot grid (space-y-6) */}
                <section className="space-y-6">
                  <div className="flex h-7 items-center">
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Skeleton
                        key={i}
                        className="aspect-video rounded-xl ring-1 ring-white/8"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }, (_, i) => (
                      <Skeleton
                        key={i}
                        className="aspect-video rounded-xl ring-1 ring-white/8"
                      />
                    ))}
                  </div>
                </section>

                {/* Related: RelatedCarousel (h2 text-lg mb-4, w-28/sm:w-32 covers).
                    Most games have at least "Similar games". */}
                <div className="space-y-10">
                  <section>
                    <div className="mb-4 flex h-7 items-center">
                      <Skeleton className="h-5 w-32 rounded-md" />
                    </div>
                    <div className="flex gap-4 overflow-hidden pt-2 pb-3">
                      {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton
                          key={i}
                          className="w-28 sm:w-32 flex-none aspect-3/4 rounded-xl sm:rounded-2xl ring-1 ring-white/8"
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* DetailsGrid */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="bg-white/3 rounded-2xl border border-white/8 p-5 sm:p-6">
                <div className="mb-4 flex h-4 items-center">
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="flex-1 h-16.25 rounded-xl" />
                  <Skeleton className="flex-1 h-16.25 rounded-xl" />
                </div>
                {(
                  [
                    [72, [104]],
                    [64, [88, 72]],
                    [60, "text"],
                    [68, [104, 96, 120, 136, 92, 88, 120]],
                    [80, [96]],
                    [76, [104]],
                    [56, [64, 72, 88]],
                    [52, [88]],
                    [80, [64, 72]],
                    [100, "text2"],
                  ] as const
                ).map(([label, content], i) => (
                  <div
                    key={i}
                    className="py-3 border-b border-white/6 last:border-b-0 last:pb-0"
                  >
                    <div className="mb-1.5 flex h-[16.5px] items-center">
                      <Skeleton
                        className="h-3 rounded-md"
                        style={{ width: `${label}px` }}
                      />
                    </div>
                    {typeof content === "string" ? (
                      Array.from(
                        { length: content === "text2" ? 3 : 1 },
                        (_, j) => (
                          <div key={j} className="flex h-5 items-center">
                            <Skeleton className="h-3.5 w-4/5 rounded-md" />
                          </div>
                        )
                      )
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {content.map((w, j) => (
                          <Skeleton
                            key={j}
                            className="h-7 rounded-lg"
                            style={{ width: `${w}px` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
