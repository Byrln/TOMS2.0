import { index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { departures } from "./departures";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const departureReadiness = pgTable("departure_readiness", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  departureId: uuid("departure_id").notNull().references(() => departures.id, { onDelete: "cascade" }),
  area: text("area").notNull(),
  completionPercent: integer("completion_percent").default(0).notNull(),
  label: text("label").notNull(),
  blockingCount: integer("blocking_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
}, (table) => [index("departure_readiness_lookup_idx").on(table.tenantId, table.departureId, table.area)]).enableRLS();

export const operationTasks = pgTable("operation_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  departureId: uuid("departure_id").references(() => departures.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id"),
  title: text("title").notNull(),
  status: text("status").default("OPEN").notNull(),
  priority: text("priority").default("NORMAL").notNull(),
  assigneeUserId: uuid("assignee_user_id"),
  ...timestamps(),
}, (table) => [index("operation_tasks_queue_idx").on(table.tenantId, table.status, table.priority)]).enableRLS();
