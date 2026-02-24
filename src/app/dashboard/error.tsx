"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-bold">Failed to load dashboard</h2>
        <p className="text-white/40 text-sm mt-2">
          {error.message || "Something went wrong loading your dashboard."}
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
