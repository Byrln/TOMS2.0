import { sql } from "drizzle-orm";
import { bigint, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { bookings } from "./bookings";
import { paymentAttemptStatusEnum, paymentStatusEnum, reconciliationStatusEnum } from "./enums";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").default("DRAFT").notNull(),
  totalMinor: bigint("total_minor", { mode: "bigint" }).notNull(),
  paidMinor: bigint("paid_minor", { mode: "bigint" }).default(sql`0`).notNull(),
  currency: text("currency").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  uniqueIndex("invoices_tenant_number_uidx").on(table.tenantId, table.invoiceNumber),
  index("invoices_booking_idx").on(table.tenantId, table.bookingId),
]).enableRLS();

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  provider: text("provider").notNull(),
  providerTransactionId: text("provider_transaction_id"),
  status: paymentStatusEnum("status").default("UNPAID").notNull(),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  currency: text("currency").notNull(),
  settlementAmountMinor: bigint("settlement_amount_minor", { mode: "bigint" }),
  settlementCurrency: text("settlement_currency"),
  reconciliationStatus: reconciliationStatusEnum("reconciliation_status").default("UNMATCHED").notNull(),
  succeededAt: timestamp("succeeded_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  uniqueIndex("payments_provider_transaction_uidx").on(table.provider, table.providerTransactionId),
  index("payments_tenant_status_idx").on(table.tenantId, table.status),
]).enableRLS();

export const paymentAttempts = pgTable("payment_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  idempotencyKey: text("idempotency_key").notNull(),
  status: paymentAttemptStatusEnum("status").default("PENDING").notNull(),
  providerReference: text("provider_reference"),
  response: jsonb("response").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
}, (table) => [uniqueIndex("payment_attempts_tenant_key_uidx").on(table.tenantId, table.idempotencyKey)]).enableRLS();

export const refunds = pgTable("refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").notNull().references(() => payments.id),
  idempotencyKey: text("idempotency_key").notNull(),
  reason: text("reason").notNull(),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  currency: text("currency").notNull(),
  internalStatus: text("internal_status").default("REQUESTED").notNull(),
  providerStatus: text("provider_status").default("NOT_SUBMITTED").notNull(),
  requestedBy: uuid("requested_by").notNull(),
  approvedBy: uuid("approved_by"),
  ...timestamps(),
}, (table) => [uniqueIndex("refunds_tenant_key_uidx").on(table.tenantId, table.idempotencyKey)]).enableRLS();

export const paymentWebhookEvents = pgTable("payment_webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  provider: text("provider").notNull(),
  providerEventId: text("provider_event_id").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("payment_webhook_provider_event_uidx").on(table.provider, table.providerEventId)]).enableRLS();
