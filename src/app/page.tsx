import Link from "next/link";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const steps = [
    { n: "01", t: "Sign up", d: "Email, Google, or GitHub. Pick a username." },
    {
      n: "02",
      t: "Add games",
      d: "Search IGDB, categorize, rate. Or bulk add.",
    },
    {
      n: "03",
      t: "Share",
      d: "Your catalog is live. Send your profile link.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090d] text-white overflow-hidden">
      <nav className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between relative z-10">
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

      <section className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium mb-8">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Your gaming catalog
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Track games.
            <br />
            <span className="text-primary">Share your taste.</span>
          </h2>
          <p className="text-white/40 text-base sm:text-lg mt-6 max-w-lg mx-auto leading-relaxed">
            Organize your library into categories, rate every game, and get a
            public profile you can share anywhere.
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Start tracking &mdash; free
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:row-span-2 rounded-2xl border border-white/8 bg-white/3 p-8 flex flex-col justify-between min-h-[320px]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-4">
                Organize
              </p>
              <h3 className="text-xl font-bold leading-snug">
                Five categories.
                <br />
                <span className="text-white/50">One clean library.</span>
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                {
                  l: "Finished",
                  c: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                },
                {
                  l: "Playing",
                  c: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                },
                {
                  l: "Want to Play",
                  c: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                },
                {
                  l: "On Hold",
                  c: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                },
                {
                  l: "Dropped",
                  c: "bg-red-500/20 text-red-400 border-red-500/30",
                },
              ].map((cat) => (
                <span
                  key={cat.l}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${cat.c}`}
                >
                  {cat.l}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
              Search
            </p>
            <h3 className="text-base font-bold">200,000+ games from IGDB</h3>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
              Search by name or ID. Every game you&apos;ve ever played is
              already in the database.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
              Bulk add
            </p>
            <h3 className="text-base font-bold">Add games in batches</h3>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
              Queue up your whole backlog and add everything at once. Build your
              catalog in minutes, not hours.
            </p>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-white/8 bg-white/3 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
                  Share
                </p>
                <h3 className="text-xl font-bold leading-snug">
                  Your profile at{" "}
                  <span className="text-primary">/u/yourname</span>
                </h3>
                <p className="text-white/40 text-sm mt-2 leading-relaxed max-w-md">
                  A beautiful public page with your stats, categories, and game
                  grid. Custom OG image included &mdash; looks great when
                  shared.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="h-9 rounded-lg bg-white/5 border border-white/10 px-4 flex items-center">
                  <span className="text-xs text-white/40 font-mono">
                    nextlevel.shanu.dev/u/you
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-20 pt-12">
        <div className="absolute inset-0 bg-linear-to-b from-white/2 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="absolute -top-2 right-0 text-6xl font-bold text-white/4 leading-none select-none">
                  {s.n}
                </span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/20 mb-3">
                  {s.n === "01" ? "How it works" : "\u00A0"}
                </p>
                <h4 className="text-sm font-semibold">{s.t}</h4>
                <p className="text-white/35 text-xs mt-1 leading-relaxed">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="h-px bg-white/6 mb-12 mx-[30vw]" />
      <section className="mx-auto max-w-6xl px-6 pb-32 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="text-center relative z-10">
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to start?
          </h3>
          <p className="text-white/40 text-sm mt-3 max-w-sm mx-auto">
            Free. No ads. Just your games.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Create your catalog
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Explore games
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/25">NextLevel</span>
            <span className="text-white/10">&middot;</span>
            <a
              href="https://www.igdb.com/api"
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
