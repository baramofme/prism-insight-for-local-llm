// WebAuthn passkey credentials for Better Auth
import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateAuthId } from "./id";
import { user } from "./user";

export const passkey = pgTable("passkey", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("passkey")),
  name: text(),
  publicKey: text().notNull(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  credentialID: text().notNull().unique(),
  counter: integer().default(0).notNull(),
  deviceType: text().notNull(),
  backedUp: boolean().notNull(),
  transports: text(),
  aaguid: text(),
  lastUsedAt: timestamp({ withTimezone: true, mode: "date" }),
  deviceName: text(),
  platform: text(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("passkey_user_id_idx").on(table.userId)]);
export type Passkey = typeof passkey.$inferSelect;
export type NewPasskey = typeof passkey.$inferInsert;
