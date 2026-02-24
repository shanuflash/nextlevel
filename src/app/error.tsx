"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#09090d] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-white/40 text-sm mt-2">
          {error.message || "An unexpected error occurred."}
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
