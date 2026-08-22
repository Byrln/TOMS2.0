import { date, index, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { departureStatusEnum, tripStatusEnum } from "./enums";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";
import { tourDefinitions } from "./tours";

export const departures = pgTable("departures", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  tourId: uuid("tour_id").notNull().references(() => tourDefinitions.id, { onDelete: "restrict" }),
  code: text("code").notNull(),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
  capacity: integer("capacity").notNull(),
  confirmedCount: integer("confirmed_count").default(0).notNull(),
  heldCount: integer("held_count").default(0).notNull(),
  status: departureStatusEnum("status").default("DRAFT").notNull(),
  tripStatus: tripStatusEnum("trip_status").default("UPCOMING").notNull(),
  ...timestamps(),
}, (table) => [
  uniqueIndex("departures_tenant_code_uidx").on(table.tenantId, table.code),
  index("departures_tenant_tour_date_idx").on(table.tenantId, table.tourId, table.startsOn),
  index("departures_tenant_status_date_idx").on(table.tenantId, table.status, table.startsOn),
]).enableRLS();
