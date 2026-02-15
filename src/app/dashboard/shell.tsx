"use client";

import { AuthNav } from "@/src/components/auth-nav";

interface DashboardUser {
  name: string;
  image?: string;
  username?: string;
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090d] text-white flex flex-col">
      <AuthNav user={user} />
      <main className="mx-auto max-w-6xl px-6 py-8 w-full flex-1">
        {children}
      </main>
      <footer className="border-t border-white/6 mt-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-white/20">
            NextLevel — Your Gaming Catalog
          </span>
          <a
            href="https://www.igdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Powered by IGDB
          </a>
        </div>
      </footer>
    </div>
  );
}
