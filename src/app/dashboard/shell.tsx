"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/src/lib/auth-client";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/games", label: "Games", icon: "🎮" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <nav className="border-b border-white/6 bg-white/1">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight mr-4">
            Next<span className="text-purple-400">Level</span>
          </Link>

          <div className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-white/8 text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/explore"
              className="px-3 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              🔍 Explore
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user.username ? (
              <Link
                href={`/u/${user.username}`}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                View Profile
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                className="text-xs text-amber-400/60 hover:text-amber-400 transition-colors"
              >
                Set Username
              </Link>
            )}
            <div className="flex items-center gap-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-7 rounded-full ring-1 ring-white/10"
                />
              ) : (
                <div className="size-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-medium text-purple-400">
                  {user.name[0]}
                </div>
              )}
              <button
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/";
                      },
                    },
                  })
                }
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
