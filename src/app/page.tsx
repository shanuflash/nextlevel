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
          Manual Game Tracker
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
          {[
            {
              title: "Categorize",
              desc: "Organize games into Finished, Playing, Want to Play, On Hold, or Dropped.",
              icon: "📂",
            },
            {
              title: "Rate & Track",
              desc: "Add ratings and notes. Keep your gaming history complete.",
              icon: "⭐",
            },
            {
              title: "Share",
              desc: "Get a beautiful public profile at /u/yourname. Show off your taste.",
              icon: "🔗",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/3 rounded-2xl border border-white/8 p-6"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <span className="text-xs text-white/25">
            NextLevel — Manual Game Tracker
          </span>
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
