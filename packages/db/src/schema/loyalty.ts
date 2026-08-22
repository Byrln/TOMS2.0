import { bigint, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const loyaltyEntries = pgTable("loyalty_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  customerAccountId: uuid("customer_account_id").notNull(),
  bookingId: uuid("booking_id"),
  kind: text("kind").notNull(),
  points: bigint("points", { mode: "bigint" }).notNull(),
  reason: text("reason").notNull(),
  ...timestamps(),
}, (table) => [index("loyalty_customer_idx").on(table.tenantId, table.customerAccountId, table.createdAt)]).enableRLS();
