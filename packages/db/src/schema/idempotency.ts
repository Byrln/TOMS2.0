import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { tenantIdColumn } from "./helpers";
import { tenants } from "./tenancy";

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  operation: text("operation").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  requestHash: text("request_hash").notNull(),
  result: jsonb("result").$type<Record<string, unknown>>(),
  resourceType: text("resource_type"),
  resourceId: uuid("resource_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("idempotency_keys_operation_uidx").on(table.tenantId, table.operation, table.idempotencyKey),
  index("idempotency_keys_expiry_idx").on(table.expiresAt),
]).enableRLS();
