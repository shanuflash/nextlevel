import Link from "next/link";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <nav className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Next<span className="text-primary">Level</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
          Your Gaming Catalog
        </div>
        <h2 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Your games.{" "}
          <span className="text-primary">Your categories.</span>{" "}
          Your profile.
        </h2>
        <p className="text-white/50 text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Track what you&apos;re playing, finished, or want to play. Build a
          beautiful game catalog and share it with the world.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 rounded-full text-sm font-medium bg-white/8 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
          >
            Explore Games
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
            <h3 className="font-semibold text-sm">Categorize</h3>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">
              Organize games into Finished, Playing, Want to Play, On Hold, or Dropped.
            </p>
          </div>
          <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
            <h3 className="font-semibold text-sm">Rate & Track</h3>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">
              Add ratings and notes. Keep your gaming history complete.
            </p>
          </div>
          <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
            <h3 className="font-semibold text-sm">Share</h3>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">
              Get a public profile at /u/yourname. Show off your taste.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/25">
              NextLevel — Your Gaming Catalog
            </span>
            <span className="text-white/10">·</span>
            <a
              href="https://www.igdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Powered by IGDB
            </a>
          </div>
          <Link
            href="/login"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
