import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { documentTypeEnum, documentVisibilityEnum } from "./enums";
import { localizedText, tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id"),
  departureId: uuid("departure_id"),
  travelerProfileId: uuid("traveler_profile_id"),
  type: documentTypeEnum("type").notNull(),
  titleI18n: localizedText("title_i18n").notNull(),
  visibility: documentVisibilityEnum("visibility").default("STAFF").notNull(),
  bucket: text("bucket").notNull(),
  objectPath: text("object_path").notNull(),
  contentType: text("content_type").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  ...timestamps(),
}, (table) => [
  index("documents_booking_idx").on(table.tenantId, table.bookingId),
  index("documents_departure_idx").on(table.tenantId, table.departureId),
]).enableRLS();
