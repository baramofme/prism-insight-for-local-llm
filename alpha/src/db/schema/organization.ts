// Multi-tenant organizations and memberships (role: owner | admin | member)
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { generateAuthId } from "./id";
import { user } from "./user";

export const organization = pgTable("organization", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("organization")),
  name: text().notNull(),
  slug: text().notNull().unique(),
  logo: text(),
  metadata: text(),
  stripeCustomerId: text(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});
export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export const member = pgTable("member", {
  id: text().primaryKey().$defaultFn(() => generateAuthId("member")),
  userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
  organizationId: text().notNull().references(() => organization.id, { onDelete: "cascade" }),
  role: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  unique("member_user_org_unique").on(table.userId, table.organizationId),
  index("member_user_id_idx").on(table.userId),
  index("member_organization_id_idx").on(table.organizationId),
]);
export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
}));
export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, { fields: [member.userId], references: [user.id] }),
  organization: one(organization, { fields: [member.organizationId], references: [organization.id] }),
}));
