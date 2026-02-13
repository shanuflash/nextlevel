import type { Metadata } from "next";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/auth";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./shell";

export const metadata: Metadata = {
  title: "Dashboard",
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
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
        username: dbUser?.username ?? undefined,
      }}
    >
      {children}
    </DashboardShell>
  );
}
