// Better Auth core schema: user, session, identity (OAuth), verification.
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { generateAuthId } from "./id";

export const user = pgTable("user", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("user")),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  isAnonymous: boolean().default(false).notNull(),
  stripeCustomerId: text(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const session = pgTable("session", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("session")),
  expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text(),
}, (table) => [
  index("session_user_id_idx").on(table.userId),
  index("session_active_org_id_idx").on(table.activeOrganizationId),
]);
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export const identity = pgTable("identity", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("account")),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
  refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: "date" }),
  scope: text(),
  password: text(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  unique("identity_provider_account_unique").on(table.providerId, table.accountId),
  index("identity_user_id_idx").on(table.userId),
]);
export type Identity = typeof identity.$inferSelect;
export type NewIdentity = typeof identity.$inferInsert;

export const verification = pgTable("verification", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("verification")),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  unique("verification_identifier_value_unique").on(table.identifier, table.value),
  index("verification_identifier_idx").on(table.identifier),
  index("verification_value_idx").on(table.value),
  index("verification_expires_at_idx").on(table.expiresAt),
]);
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  identities: many(identity),
}));
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));
export const identityRelations = relations(identity, ({ one }) => ({
  user: one(user, { fields: [identity.userId], references: [user.id] }),
}));
