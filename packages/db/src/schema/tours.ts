import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { tourStatusEnum } from "./enums";
import { tenants } from "./tenancy";

export const tourDefinitions = pgTable("tour_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  nameI18n: localizedText("name_i18n").notNull(),
  summaryI18n: localizedText("summary_i18n").notNull(),
  descriptionI18n: localizedText("description_i18n").notNull(),
  category: text("category").notNull(),
  durationDays: integer("duration_days").notNull(),
  durationNights: integer("duration_nights").notNull(),
  difficulty: text("difficulty").default("MODERATE").notNull(),
  destinations: jsonb("destinations").$type<string[]>().default([]).notNull(),
  languages: jsonb("languages").$type<Array<"mn" | "en">>().default(["mn", "en"]).notNull(),
  highlightsI18n: jsonb("highlights_i18n").$type<Array<{ mn: string; en: string }>>().default([]).notNull(),
  inclusionsI18n: jsonb("inclusions_i18n").$type<Array<{ mn: string; en: string }>>().default([]).notNull(),
  exclusionsI18n: jsonb("exclusions_i18n").$type<Array<{ mn: string; en: string }>>().default([]).notNull(),
  heroImagePath: text("hero_image_path"),
  status: tourStatusEnum("status").default("DRAFT").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  uniqueIndex("tour_definitions_tenant_slug_uidx").on(table.tenantId, table.slug),
  index("tour_definitions_tenant_status_idx").on(table.tenantId, table.status),
]).enableRLS();
