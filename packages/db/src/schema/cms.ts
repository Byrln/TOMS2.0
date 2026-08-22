import { index, integer, jsonb, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { storefronts } from "./storefront";
import { tenants } from "./tenancy";

export const cmsPages = pgTable("cms_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  storefrontId: uuid("storefront_id").notNull().references(() => storefronts.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  titleI18n: localizedText("title_i18n").notNull(),
  seoI18n: jsonb("seo_i18n").$type<Record<"mn" | "en", { title: string; description: string }>>().notNull(),
  status: text("status").default("DRAFT").notNull(),
  ...timestamps(),
}, (table) => [uniqueIndex("cms_pages_storefront_slug_uidx").on(table.storefrontId, table.slug)]).enableRLS();

export const cmsBlocks = pgTable("cms_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  pageId: uuid("page_id").notNull().references(() => cmsPages.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  sortOrder: integer("sort_order").notNull(),
  contentI18n: jsonb("content_i18n").$type<Record<"mn" | "en", Record<string, unknown>>>().notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
}, (table) => [index("cms_blocks_page_order_idx").on(table.pageId, table.sortOrder)]).enableRLS();
