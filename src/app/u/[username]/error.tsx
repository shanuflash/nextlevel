"use client";

import Link from "next/link";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#09090d] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p className="text-white/40 text-sm mt-2">
          {error.message || "Something went wrong loading this profile."}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
