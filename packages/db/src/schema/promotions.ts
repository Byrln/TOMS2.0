import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { promotionPresentationEnum } from "./enums";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const promotions = pgTable("promotions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  nameI18n: localizedText("name_i18n").notNull(),
  descriptionI18n: localizedText("description_i18n").notNull(),
  conditions: jsonb("conditions").$type<Record<string, unknown>>().notNull(),
  benefit: jsonb("benefit").$type<Record<string, unknown>>().notNull(),
  presentation: promotionPresentationEnum("presentation").default("COUPON").notNull(),
  redemptionLimit: integer("redemption_limit"),
  perCustomerLimit: integer("per_customer_limit").default(1).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  status: text("status").default("DRAFT").notNull(),
  ...timestamps(),
}, (table) => [
  uniqueIndex("promotions_tenant_code_uidx").on(table.tenantId, table.code),
  index("promotions_active_idx").on(table.tenantId, table.status, table.startsAt, table.endsAt),
]).enableRLS();

export const promotionRedemptions = pgTable("promotion_redemptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  promotionId: uuid("promotion_id").notNull().references(() => promotions.id),
  bookingId: uuid("booking_id").notNull(),
  customerAccountId: uuid("customer_account_id"),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("promotion_redemptions_limit_idx").on(table.tenantId, table.promotionId, table.customerAccountId)]).enableRLS();
