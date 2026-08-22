import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { localizedText, timestamps } from "./helpers";
import { localeEnum, membershipStatusEnum, staffRoleEnum, tenantStatusEnum } from "./enums";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  nameI18n: localizedText("name_i18n").notNull(),
  defaultLocale: localeEnum("default_locale").default("mn").notNull(),
  supportedLocales: jsonb("supported_locales").$type<Array<"mn" | "en">>().default(["mn", "en"]).notNull(),
  defaultCurrency: text("default_currency").default("MNT").notNull(),
  timeZone: text("time_zone").default("Asia/Ulaanbaatar").notNull(),
  status: tenantStatusEnum("status").default("ACTIVE").notNull(),
  ...timestamps(),
}, (table) => [uniqueIndex("tenants_slug_uidx").on(table.slug)]).enableRLS();

export const tenantMemberships = pgTable("tenant_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  role: staffRoleEnum("role").notNull(),
  status: membershipStatusEnum("status").default("ACTIVE").notNull(),
  invitedAt: timestamp("invited_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  uniqueIndex("tenant_memberships_tenant_user_uidx").on(table.tenantId, table.userId),
  index("tenant_memberships_user_idx").on(table.userId),
]).enableRLS();

export const tenantDomains = pgTable("tenant_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  host: text("host").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [uniqueIndex("tenant_domains_host_uidx").on(table.host)]).enableRLS();

export const tenantSettings = pgTable("tenant_settings", {
  tenantId: uuid("tenant_id").primaryKey().references(() => tenants.id, { onDelete: "cascade" }),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
}).enableRLS();
