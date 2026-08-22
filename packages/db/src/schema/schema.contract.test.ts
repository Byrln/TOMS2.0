import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  auditLogs,
  bookings,
  customerAccounts,
  departures,
  idempotencyKeys,
  inventoryHolds,
  itineraryEvents,
  outboxEvents,
  payments,
  storefrontReleases,
  tenantMemberships,
  tenants,
  tourDefinitions,
  travelerProfiles,
} from "./index";

describe("TOMS Drizzle schema", () => {
  it("exports the canonical operational tables", () => {
    const tableNames = [
      tenants,
      tenantMemberships,
      tourDefinitions,
      departures,
      itineraryEvents,
      inventoryHolds,
      bookings,
      customerAccounts,
      travelerProfiles,
      payments,
      storefrontReleases,
      idempotencyKeys,
      auditLogs,
      outboxEvents,
    ].map((table) => getTableConfig(table).name);

    expect(tableNames).toEqual([
      "tenants",
      "tenant_memberships",
      "tour_definitions",
      "departures",
      "itinerary_events",
      "inventory_holds",
      "bookings",
      "customer_accounts",
      "traveler_profiles",
      "payments",
      "storefront_releases",
      "idempotency_keys",
      "audit_logs",
      "outbox_events",
    ]);
  });

  it("stores every product-facing text as an MN/EN localized object", () => {
    const tour = getTableConfig(tourDefinitions);
    const columnNames = tour.columns.map((column) => column.name);

    expect(columnNames).toContain("name_i18n");
    expect(columnNames).toContain("summary_i18n");
    expect(columnNames).toContain("description_i18n");
  });

  it("enables row-level security on every tenant-owned table", () => {
    const tables = [
      tenants,
      tenantMemberships,
      tourDefinitions,
      departures,
      bookings,
      payments,
      storefrontReleases,
      auditLogs,
      outboxEvents,
    ];

    for (const table of tables) {
      expect(getTableConfig(table).enableRLS).toBe(true);
    }
  });
});
