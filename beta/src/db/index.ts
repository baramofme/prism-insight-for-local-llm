/**
 * Drizzle client with two backends:
 *  - DATABASE_URL set   → postgres-js (Neon / any real Postgres) — production
 *  - DATABASE_URL unset → PGlite (in-process Postgres, ./.pglite file) — zero-setup dev
 *
 * PGlite is real Postgres compiled to WASM, so the schema, Better Auth, and all
 * SQL work unchanged. It is single-process / dev-only — use a real DB in prod.
 */
import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { env } from "@/lib/env";
import * as schema from "./schema";

type AppDb = PostgresJsDatabase<typeof schema>;

const g = globalThis as unknown as { __appDb?: AppDb };

// During `next build` we never touch PGlite (WASM): use a lazy postgres-js
// client (no connection happens at import) so the module graph compiles cleanly.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

async function createPostgresJs(url: string): Promise<AppDb> {
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = (await import("postgres")).default;
  const client = postgres(url, {
    prepare: false, // required for Neon pooled (pgbouncer) endpoints
    transform: { undefined: null },
    onnotice: () => {},
  });
  return drizzle(client, { schema, casing: "snake_case" });
}

async function createDb(): Promise<AppDb> {
  if (process.env.DATABASE_URL) return createPostgresJs(env.DATABASE_URL);
  if (isBuild) return createPostgresJs(env.DATABASE_URL); // placeholder, never connects

  // —— PGlite dev backend (runtime only) ——
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  const client = new PGlite("./.pglite"); // persisted across restarts
  const db = drizzle(client, { schema, casing: "snake_case" }) as unknown as AppDb;
  await migrate(db as never, { migrationsFolder: "./drizzle" }); // idempotent
  return db;
}

if (!g.__appDb) {
  g.__appDb = await createDb();
}

export const db: AppDb = g.__appDb;
export { schema, sql };
export * from "./schema";
export type DB = AppDb;
