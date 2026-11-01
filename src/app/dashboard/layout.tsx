import type { Metadata } from "next";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./shell";

// A plain string title here would drop the root "%s | NextLevel" template for
// every dashboard page, so re-declare it.
export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | NextLevel",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { username: true },
  });

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        image: session.user.image ?? undefined,
        username: dbUser?.username ?? undefined,
      }}
    >
      {children}
    </DashboardShell>
  );
}
