import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantIdColumn } from "./helpers";
import { tenants } from "./tenancy";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id"),
  requestId: text("request_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  before: jsonb("before").$type<Record<string, unknown>>(),
  after: jsonb("after").$type<Record<string, unknown>>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("audit_logs_entity_idx").on(table.tenantId, table.entityType, table.entityId, table.occurredAt)]).enableRLS();
