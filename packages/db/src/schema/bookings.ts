import { bigint, boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { bookingStatusEnum, paymentStatusEnum } from "./enums";
import { departures } from "./departures";
import { tenantIdColumn, timestamps } from "./helpers";
import { inventoryHolds } from "./inventory";
import { customerAccounts, people, travelerProfiles } from "./identity";
import { tenants } from "./tenancy";
import { tourDefinitions } from "./tours";

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  bookingNumber: text("booking_number").notNull(),
  tourId: uuid("tour_id").notNull().references(() => tourDefinitions.id),
  departureId: uuid("departure_id").notNull().references(() => departures.id),
  holdId: uuid("hold_id").references(() => inventoryHolds.id),
  customerAccountId: uuid("customer_account_id").references(() => customerAccounts.id),
  organizerPersonId: uuid("organizer_person_id").references(() => people.id),
  payerPersonId: uuid("payer_person_id").references(() => people.id),
  organizerEmail: text("organizer_email").notNull(),
  partySize: integer("party_size").notNull(),
  status: bookingStatusEnum("status").default("DRAFT").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("UNPAID").notNull(),
  totalMinor: bigint("total_minor", { mode: "bigint" }).notNull(),
  currency: text("currency").notNull(),
  source: text("source").default("STOREFRONT").notNull(),
  tourSnapshot: jsonb("tour_snapshot").$type<Record<string, unknown>>().notNull(),
  priceSnapshot: jsonb("price_snapshot").$type<Record<string, unknown>>().notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  uniqueIndex("bookings_tenant_number_uidx").on(table.tenantId, table.bookingNumber),
  index("bookings_tenant_departure_status_idx").on(table.tenantId, table.departureId, table.status),
  index("bookings_tenant_payment_status_idx").on(table.tenantId, table.paymentStatus),
]).enableRLS();

export const bookingParties = pgTable("booking_parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  travelerProfileId: uuid("traveler_profile_id").notNull().references(() => travelerProfiles.id),
  authUserId: uuid("auth_user_id"),
  travelerSnapshot: jsonb("traveler_snapshot").$type<Record<string, unknown>>().notNull(),
  isOrganizer: boolean("is_organizer").default(false).notNull(),
  ...timestamps(),
}, (table) => [
  uniqueIndex("booking_parties_booking_traveler_uidx").on(table.bookingId, table.travelerProfileId),
  index("booking_parties_auth_user_idx").on(table.authUserId),
]).enableRLS();
