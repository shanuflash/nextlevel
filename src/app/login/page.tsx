import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/session";
import { safeNextPath } from "@/src/lib/safe-next";
import { LoginForm } from "./login-form";

// Server component so the form is in the initial HTML; signed-in visitors
// go straight to where they were headed.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextParam = typeof next === "string" ? next : null;
  if (await getSession()) redirect(safeNextPath(nextParam));
  return <LoginForm nextParam={nextParam} />;
}
