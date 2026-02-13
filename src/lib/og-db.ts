import { createClient, type InValue } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function ogQuery<T>(
  sql: string,
  args: InValue[] = []
): Promise<T[]> {
  const result = await client.execute({ sql, args });
  return result.rows as unknown as T[];
}
