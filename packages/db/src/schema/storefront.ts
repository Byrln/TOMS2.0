import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { releaseStatusEnum } from "./enums";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const storefronts = pgTable("storefronts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  brandNameI18n: localizedText("brand_name_i18n").notNull(),
  template: text("template").default("HIMALAYA").notNull(),
  themeTokens: jsonb("theme_tokens").$type<Record<string, string>>().default({}).notNull(),
  navigationI18n: jsonb("navigation_i18n").$type<Record<string, unknown>>().default({}).notNull(),
  status: releaseStatusEnum("status").default("DRAFT").notNull(),
  activeReleaseId: uuid("active_release_id"),
  ...timestamps(),
}, (table) => [uniqueIndex("storefronts_tenant_slug_uidx").on(table.tenantId, table.slug)]).enableRLS();

export const storefrontReleases = pgTable("storefront_releases", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  storefrontId: uuid("storefront_id").notNull().references(() => storefronts.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  status: releaseStatusEnum("status").default("DRAFT").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  checksum: text("checksum").notNull(),
  publishedBy: uuid("published_by"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("storefront_releases_storefront_version_uidx").on(table.storefrontId, table.version),
  index("storefront_releases_published_idx").on(table.tenantId, table.status, table.publishedAt),
]).enableRLS();
