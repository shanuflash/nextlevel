import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});
