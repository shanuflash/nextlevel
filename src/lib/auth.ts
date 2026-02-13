import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as authSchema from "@/schema/auth-schema";
import * as gameSchema from "@/schema/game-schema";

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
  schema: { ...authSchema, ...gameSchema },
});

function sanitizeEmailToUsername(email: string): string {
  const prefix = email.split("@")[0].toLowerCase();
  let sanitized = prefix
    .replace(/[^a-z0-9_.]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[_.]|[_.]$/g, "");
  if (sanitized.length < 3) {
    sanitized = sanitized.padEnd(3, "0");
  }
  return sanitized.slice(0, 25);
}

async function findUniqueUsername(base: string): Promise<string> {
  const existing = await db
    .select({ username: authSchema.user.username })
    .from(authSchema.user)
    .where(eq(authSchema.user.username, base))
    .limit(1);

  if (existing.length === 0) return base;

  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const candidate = `${base.slice(0, 25)}${suffix}`;
    const check = await db
      .select({ username: authSchema.user.username })
      .from(authSchema.user)
      .where(eq(authSchema.user.username, candidate))
      .limit(1);
    if (check.length === 0) return candidate;
  }

  return `${base.slice(0, 20)}${Date.now().toString(36)}`;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
  }),
  plugins: [admin(), username(), nextCookies()],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
      mapProfileToUser: (profile) => ({
        name: profile.name,
        email: profile.email,
      }),
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.username) {
            return { data: user };
          }

          const base = sanitizeEmailToUsername(user.email);
          const uniqueUsername = await findUniqueUsername(base);

          return {
            data: {
              ...user,
              username: uniqueUsername,
              displayUsername: uniqueUsername,
            },
          };
        },
      },
    },
  },
});
