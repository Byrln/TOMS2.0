import { describe, expect, it } from "vitest";
import { storefrontHomeResponseSchema, travelerDashboardResponseSchema } from "@toms/contracts";
import { createDemoServices, demoAccessToken } from "./demo-services";

describe("deterministic development services", () => {
  it("populates every operational domain with coherent mixed-state data", async () => {
    const services = createDemoServices();
    const actor = await services.identity.resolveActor(demoAccessToken);
    const tours = await services.tours.list(actor, { page: 1, pageSize: 25, locale: "en" }) as { data: unknown[] };
    const departures = await services.departures.list(actor) as { data: unknown[] };
    const allRows = { page: 1, pageSize: 100 };
    const bookings = await services.backoffice.list(actor, "bookings", "en", allRows) as { items: Array<{ status: string; paymentStatus: string }> };
    const travelers = await services.backoffice.list(actor, "travelers", "en", allRows) as { items: unknown[] };

    expect(tours.data).toHaveLength(8);
    expect(departures.data).toHaveLength(16);
    expect(bookings.items).toHaveLength(48);
    expect(travelers.items).toHaveLength(96);
    expect(new Set(bookings.items.map((item) => item.status)).size).toBeGreaterThan(2);
    expect(new Set(bookings.items.map((item) => item.paymentStatus)).size).toBeGreaterThan(2);
  });

  it("serves runtime-valid storefront and traveler compositions", async () => {
    const services = createDemoServices();
    const home = await services.storefront.home("localhost", "en");
    const dashboard = await services.traveler.dashboard(demoAccessToken, "en");

    expect(() => storefrontHomeResponseSchema.parse(home)).not.toThrow();
    expect(() => travelerDashboardResponseSchema.parse(dashboard)).not.toThrow();
  });
});
