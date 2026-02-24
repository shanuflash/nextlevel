"use client";

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#09090d] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-bold">Failed to load explore page</h2>
        <p className="text-white/40 text-sm mt-2">
          {error.message || "Something went wrong."}
        </p>
        <button
          onClick={reset}
          className="mt-6 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
