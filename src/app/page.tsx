import Link from "next/link";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/src/components/scroll-reveal";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const steps = [
    {
      number: "01",
      title: "Sign up",
      description: "Email, Google, or GitHub. Pick a username.",
    },
    {
      number: "02",
      title: "Add games",
      description: "Search IGDB, categorize, rate. Or bulk add.",
    },
    {
      number: "03",
      title: "Share",
      description: "Your catalog is live. Send your profile link.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090d] text-white overflow-hidden">
      <ScrollReveal y={-10}>
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
      </ScrollReveal>

      <section className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-28 pb-20 text-center relative z-10">
          <ScrollReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium mb-8">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Your gaming catalog
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto">
              Track games.
              <br />
              <span className="text-primary">Share your taste.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <p className="text-white/40 text-base sm:text-lg mt-6 max-w-lg mx-auto leading-relaxed">
              Organize your library into categories, rate every game, and get a
              public profile you can share anywhere.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
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
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StaggerItem className="md:row-span-2 rounded-2xl border border-white/8 bg-white/3 p-8 flex flex-col justify-between min-h-[320px]">
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
                  label: "Finished",
                  className:
                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                },
                {
                  label: "Playing",
                  className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                },
                {
                  label: "Want to Play",
                  className:
                    "bg-amber-500/20 text-amber-400 border-amber-500/30",
                },
                {
                  label: "On Hold",
                  className:
                    "bg-orange-500/20 text-orange-400 border-orange-500/30",
                },
                {
                  label: "Dropped",
                  className: "bg-red-500/20 text-red-400 border-red-500/30",
                },
              ].map((cat) => (
                <span
                  key={cat.label}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${cat.className}`}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
              Search
            </p>
            <h3 className="text-base font-bold">200,000+ games from IGDB</h3>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
              Search by name or ID. Every game you&apos;ve ever played is
              already in the database.
            </p>
          </StaggerItem>

          <StaggerItem className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
              Bulk add
            </p>
            <h3 className="text-base font-bold">Add games in batches</h3>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
              Queue up your whole backlog and add everything at once. Build your
              catalog in minutes, not hours.
            </p>
          </StaggerItem>

          <StaggerItem className="md:col-span-2 rounded-2xl border border-white/8 bg-white/3 p-8 relative overflow-hidden">
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
                    {process.env.NEXT_PUBLIC_APP_URL ?? "nextlevel.shanu.dev"}
                    /u/you
                  </span>
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      <section className="relative pb-20 pt-12">
        <div className="absolute inset-0 bg-linear-to-b from-white/2 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6" stagger={0.12}>
            {steps.map((s) => (
              <StaggerItem key={s.number} className="relative">
                <span className="absolute -top-2 right-0 text-6xl font-bold text-white/4 leading-none select-none">
                  {s.number}
                </span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/20 mb-3">
                  {s.number === "01" ? "How it works" : "\u00A0"}
                </p>
                <h4 className="text-sm font-semibold">{s.title}</h4>
                <p className="text-white/35 text-xs mt-1 leading-relaxed">
                  {s.description}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ScrollReveal>
        <div className="h-px bg-white/6 mb-12 mx-[30vw]" />
      </ScrollReveal>

      <section className="mx-auto max-w-6xl px-6 pb-32 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="text-center relative z-10">
          <ScrollReveal>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to start?
            </h3>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-white/40 text-sm mt-3 max-w-sm mx-auto">
              Free. No ads. Just your games.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
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
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal>
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
      </ScrollReveal>
    </div>
  );
}
