import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { tenantIdColumn } from "./helpers";
import { tenants } from "./tenancy";

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  aggregateType: text("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  deduplicationKey: text("deduplication_key").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  availableAt: timestamp("available_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  failedAt: timestamp("failed_at", { withTimezone: true }),
  lastError: text("last_error"),
}, (table) => [
  uniqueIndex("outbox_events_dedupe_uidx").on(table.tenantId, table.deduplicationKey),
  index("outbox_events_pending_idx").on(table.processedAt, table.availableAt),
]).enableRLS();
