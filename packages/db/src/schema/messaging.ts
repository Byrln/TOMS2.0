import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  customerAccountId: uuid("customer_account_id"),
  bookingId: uuid("booking_id"),
  departureId: uuid("departure_id"),
  subject: text("subject").notNull(),
  status: text("status").default("OPEN").notNull(),
  channel: text("channel").default("EMAIL").notNull(),
  assignedTo: uuid("assigned_to"),
  ...timestamps(),
}, (table) => [index("conversations_queue_idx").on(table.tenantId, table.status, table.updatedAt)]).enableRLS();

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderUserId: uuid("sender_user_id"),
  senderPersonId: uuid("sender_person_id"),
  body: text("body").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(),
  attachments: jsonb("attachments").$type<Array<Record<string, string>>>().default([]).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("messages_conversation_idx").on(table.tenantId, table.conversationId, table.sentAt)]).enableRLS();
