import Link from "next/link";

export function PublicNav() {
  return (
    <nav className="border-b border-white/6 bg-white/1">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Next<span className="text-purple-400">Level</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
