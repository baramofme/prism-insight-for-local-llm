import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load env for the drizzle-kit CLI (runs outside Next.js).
config({ path: ".env.local" });
config({ path: ".env" });

// `generate` does not connect to a DB, so a placeholder URL is fine offline.
// `push`/`migrate` against a real DB require a real DATABASE_URL.
const url =
  process.env.DATABASE_URL ?? "postgres://user:pass@localhost:5432/postgres";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url },
});
