import { PublicNav } from "@/src/components/public-nav";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  BrowseChipsSkeleton,
  GridSkeleton,
  RowSkeleton,
  TastemakersSkeleton,
} from "./browse";

// Mirrors explore/page.tsx (unfiltered view), reusing the same section
// skeletons the page streams behind.
export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <PublicNav />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <div>
          {/* h1: text-2xl / sm:text-3xl */}
          <div className="flex h-8 sm:h-9 items-center">
            <Skeleton className="h-6 sm:h-7 w-32 rounded-lg" />
          </div>
          {/* subtitle: text-sm, wraps to two lines on phones */}
          <div className="mt-1">
            <div className="flex h-5 items-center">
              <Skeleton className="h-3.5 w-full sm:w-96 rounded-md" />
            </div>
            <div className="flex h-5 items-center sm:hidden">
              <Skeleton className="h-3.5 w-28 rounded-md" />
            </div>
          </div>
          <Skeleton className="mt-5 h-12 max-w-xl rounded-2xl" />
        </div>

        <BrowseChipsSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <TastemakersSkeleton />
        <GridSkeleton count={12} />
      </div>
    </div>
  );
}
