import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { supplierConfirmationStatusEnum } from "./enums";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  email: text("email"),
  phone: text("phone"),
  currencies: jsonb("currencies").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
}, (table) => [index("suppliers_tenant_name_idx").on(table.tenantId, table.name)]).enableRLS();

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  departureId: uuid("departure_id").notNull(),
  type: text("type").notNull(),
  reference: text("reference"),
  titleI18n: localizedText("title_i18n").notNull(),
  confirmationStatus: supplierConfirmationStatusEnum("confirmation_status").default("NOT_REQUESTED").notNull(),
  supplierPayload: jsonb("supplier_payload").$type<Record<string, unknown>>().default({}).notNull(),
  internalNotes: text("internal_notes"),
  ...timestamps(),
}, (table) => [index("service_orders_departure_idx").on(table.tenantId, table.departureId, table.confirmationStatus)]).enableRLS();
