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

// Memoize the in-flight PROMISE, not the resolved value, so concurrent
// requests during startup share a single createDb() call. Storing the
// resolved value left a race window (first request mid-migrate, second sees
// undefined and starts a second PGlite open on the same ./.pglite dir →
// PGlite is single-process → "CREATE SCHEMA drizzle" 500).
const g = globalThis as unknown as { __appDbPromise?: Promise<AppDb> };

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

  // In-memory dev DB. Fresh on every restart (re-sign-up each time); for
  // persistence set a real DATABASE_URL.
  const client = new PGlite();
  const db = drizzle(client, { schema, casing: "snake_case" }) as unknown as AppDb;

  // Apply the schema by exec'ing the generated migration SQL directly instead
  // of drizzle's migrate({ migrationsFolder }): that migrator resolves the
  // folder via a URL and hands it to a Node fs call that Node 22+/24 rejects
  // (ERR_INVALID_ARG_TYPE → "Failed query: CREATE SCHEMA ..."). Reading the
  // files with a plain string path sidesteps the bug. Safe to re-run every
  // boot because the in-memory DB starts empty.
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), "drizzle");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const ddl = readFileSync(join(dir, f), "utf8").replace(/-->\s*statement-breakpoint/g, "");
    await client.exec(ddl);
  }
  return db;
}

g.__appDbPromise ??= createDb();

export const db: AppDb = await g.__appDbPromise;
export { schema, sql };
export * from "./schema";
export type DB = AppDb;
