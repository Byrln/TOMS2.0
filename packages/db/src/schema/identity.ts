import { index, jsonb, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { tenantIdColumn, timestamps } from "./helpers";
import { tenants } from "./tenancy";

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  authUserId: uuid("auth_user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  nationality: text("nationality"),
  preferredLocale: text("preferred_locale").default("mn").notNull(),
  ...timestamps(),
}, (table) => [
  index("people_tenant_name_idx").on(table.tenantId, table.lastName),
  uniqueIndex("people_tenant_auth_user_uidx").on(table.tenantId, table.authUserId),
]).enableRLS();

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  legalName: text("legal_name").notNull(),
  registrationNumber: text("registration_number"),
  taxNumber: text("tax_number"),
  email: text("email"),
  phone: text("phone"),
  ...timestamps(),
}, (table) => [index("organizations_tenant_name_idx").on(table.tenantId, table.legalName)]).enableRLS();

export const customerAccounts = pgTable("customer_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  personId: uuid("person_id").references(() => people.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  segment: text("segment").default("STANDARD").notNull(),
  openBalanceMinor: jsonb("open_balance_minor").$type<Record<string, string>>().default({}).notNull(),
  source: text("source"),
  ...timestamps(),
}, (table) => [index("customer_accounts_tenant_idx").on(table.tenantId)]).enableRLS();

export const travelerProfiles = pgTable("traveler_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: tenantIdColumn().references(() => tenants.id, { onDelete: "cascade" }),
  personId: uuid("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
  passportCountry: text("passport_country"),
  passportLastFour: text("passport_last_four"),
  documentReadiness: text("document_readiness").default("MISSING").notNull(),
  visaStatus: text("visa_status"),
  dietaryRequirements: text("dietary_requirements"),
  allergies: text("allergies"),
  accessibility: text("accessibility"),
  seatPreference: text("seat_preference"),
  roomPreference: text("room_preference"),
  emergencyContacts: jsonb("emergency_contacts").$type<Array<Record<string, string>>>().default([]).notNull(),
  ...timestamps(),
}, (table) => [
  uniqueIndex("traveler_profiles_tenant_person_uidx").on(table.tenantId, table.personId),
  index("traveler_profiles_tenant_readiness_idx").on(table.tenantId, table.documentReadiness),
]).enableRLS();
