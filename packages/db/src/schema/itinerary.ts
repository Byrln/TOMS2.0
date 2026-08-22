import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { itineraryVisibilityEnum } from "./enums";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { departures } from "./departures";
import { tenants } from "./tenancy";

export const itineraryDays = pgTable("itinerary_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  departureId: uuid("departure_id").notNull().references(() => departures.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  titleI18n: localizedText("title_i18n").notNull(),
  ...timestamps(),
}, (table) => [index("itinerary_days_departure_idx").on(table.tenantId, table.departureId, table.dayNumber)]).enableRLS();

export const itineraryEvents = pgTable("itinerary_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  departureId: uuid("departure_id").notNull().references(() => departures.id, { onDelete: "cascade" }),
  itineraryDayId: uuid("itinerary_day_id").references(() => itineraryDays.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  sortOrder: integer("sort_order").notNull(),
  type: text("type").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  titleI18n: localizedText("title_i18n").notNull(),
  detailsI18n: localizedText("details_i18n").notNull(),
  locationI18n: localizedText("location_i18n").notNull(),
  visibility: itineraryVisibilityEnum("visibility").default("BOOKED_TRAVELER").notNull(),
  supplierId: uuid("supplier_id"),
  serviceOrderId: uuid("service_order_id"),
  internalNotes: text("internal_notes"),
  version: integer("version").default(1).notNull(),
  changeMetadata: jsonb("change_metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps(),
}, (table) => [index("itinerary_events_departure_day_idx").on(table.tenantId, table.departureId, table.dayNumber, table.sortOrder)]).enableRLS();
