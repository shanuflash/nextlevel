import Link from "next/link";

// Shown in place of the catalog when a profile is private and the viewer
// isn't its owner. Deliberately reveals nothing beyond the handle in the URL.
export function PrivateProfile({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28">
      <div className="size-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="size-6"
        >
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>
      <h1 className="mt-5 text-xl sm:text-2xl font-bold">
        This profile is private
      </h1>
      <p className="mt-1.5 text-sm text-white/40 max-w-xs">
        @{username} keeps their catalog to themselves.
      </p>
      <Link
        href="/explore"
        className="mt-6 px-5 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/8 transition-colors"
      >
        Explore other catalogs
      </Link>
    </div>
  );
}
