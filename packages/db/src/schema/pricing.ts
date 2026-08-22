import { bigint, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { departures } from "./departures";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";
import { tourDefinitions } from "./tours";

export const tourPrices = pgTable("tour_prices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  tourId: uuid("tour_id").notNull().references(() => tourDefinitions.id, { onDelete: "cascade" }),
  departureId: uuid("departure_id").references(() => departures.id, { onDelete: "cascade" }),
  priceType: text("price_type").default("ADULT").notNull(),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  currency: text("currency").notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  ...timestamps(),
}, (table) => [index("tour_prices_lookup_idx").on(table.tenantId, table.tourId, table.departureId)]).enableRLS();

export const fxSnapshots = pgTable("fx_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  rate: text("rate").notNull(),
  source: text("source").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();
