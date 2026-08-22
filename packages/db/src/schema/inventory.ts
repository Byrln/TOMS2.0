import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { departures } from "./departures";
import { inventoryHoldStatusEnum } from "./enums";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const inventoryHolds = pgTable("inventory_holds", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  departureId: uuid("departure_id").notNull().references(() => departures.id, { onDelete: "cascade" }),
  idempotencyKey: text("idempotency_key").notNull(),
  quantity: integer("quantity").notNull(),
  status: inventoryHoldStatusEnum("status").default("ACTIVE").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  uniqueIndex("inventory_holds_tenant_idempotency_uidx").on(table.tenantId, table.idempotencyKey),
  index("inventory_holds_active_idx").on(table.tenantId, table.departureId, table.status, table.expiresAt),
]).enableRLS();
