import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDirectory = resolve(process.cwd(), "supabase", "migrations");
const foundation = readFileSync(resolve(migrationsDirectory, "20260821091854_foundation.sql"), "utf8");
const travelerClaim = readFileSync(resolve(migrationsDirectory, "20260821100701_traveler_claim_authorization.sql"), "utf8");
const seed = readFileSync(resolve(process.cwd(), "supabase", "seed.sql"), "utf8");

describe("Supabase security migrations", () => {
  it("enables RLS for every public application table", () => {
    const tableNames = [...foundation.matchAll(/create table public\.(\w+)/g)].map((match) => match[1]);
    expect(tableNames.length).toBeGreaterThanOrEqual(25);
    for (const tableName of tableNames) expect(foundation).toContain(`'${tableName}'`);
    expect(foundation).toContain("enable row level security");
  });

  it("keeps atomic booking functions service-role only", () => {
    expect(foundation).toContain("revoke all on function private.create_booking_hold");
    expect(foundation).toContain("grant execute on function private.create_booking_hold");
    expect(foundation).toContain("to service_role");
    expect(foundation).toContain("revoke all on function private.confirm_booking");
  });

  it("requires authenticated verified-email claim and traveler-specific policies", () => {
    expect(travelerClaim).toContain("verified_email text := lower");
    expect(travelerClaim).toContain("revoke all on function public.claim_booking(uuid) from public, anon");
    expect(travelerClaim).toContain("grant execute on function public.claim_booking(uuid) to authenticated");
    expect(travelerClaim).toContain("create policy traveler_itinerary_read");
    expect(travelerClaim).toContain("visibility in ('PUBLIC', 'TRAVELER')");
  });

  it("ships deterministic bilingual cross-module production seed data", () => {
    const tourInsert = seed.slice(seed.indexOf("insert into public.tour_definitions"), seed.indexOf("insert into public.departures"));
    expect(tourInsert.match(/'21111111-1111-4111-8111-11111111111\d'/g)?.length).toBeGreaterThanOrEqual(4);
    expect(tourInsert).toContain("name_i18n");
    expect(tourInsert).toContain('"mn"');
    expect(tourInsert).toContain('"en"');
    for (const entity of ["tour_prices", "itinerary_days", "itinerary_events", "bookings", "booking_parties", "invoices", "payments", "storefront_releases", "cms_blocks", "promotions", "audit_logs", "outbox_events"]) {
      expect(seed).toContain(`insert into public.${entity}`);
    }
    expect(seed).not.toContain("'DEMO'");
  });
});
