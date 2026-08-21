import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createDemoRepository } from "./repository";

describe("TOMS API vertical flow", () => {
  const ownerHeaders = { "content-type": "application/json", "x-demo-role": "OWNER" };
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp({ repository: createDemoRepository(), now: () => new Date("2026-08-21T09:00:00Z") });
  });

  it("serves health, dashboard and published storefront data", async () => {
    expect((await app.request("/health")).status).toBe(200);
    const dashboard = await (await app.request("/api/v1/admin/dashboard", { headers: ownerHeaders })).json();
    expect(dashboard.metrics.grossBookingValueMinor).toBeGreaterThan(0);
    const bootstrap = await (await app.request("/api/v1/storefront/bootstrap")).json();
    expect(bootstrap.featuredTours.length).toBeGreaterThanOrEqual(4);
    expect(bootstrap.tenant.name).toBe("TOMS Demo Travel");
  });

  it("creates an inventory hold, confirms checkout, and exposes the trip only to its traveler", async () => {
    const tours = await (await app.request("/api/v1/tours")).json();
    const departureId = tours.items[0].departures[0].id;
    const holdResponse = await app.request("/api/v1/booking-holds", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ departureId, partySize: 2, idempotencyKey: "hold-e2e-123456" })
    });
    expect(holdResponse.status).toBe(201);
    const hold = await holdResponse.json();

    const checkoutResponse = await app.request("/api/v1/checkout/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        holdId: hold.id,
        payer: { fullName: "Bat-Orgil Munkhbat", email: "bat@example.com" },
        travelers: [
          { fullName: "Bat-Orgil Munkhbat", nationality: "MN" },
          { fullName: "Enkhjin Munkhbat", nationality: "MN" }
        ],
        paymentMethod: "DEMO",
        termsAccepted: true,
        idempotencyKey: "checkout-e2e-123456"
      })
    });
    expect(checkoutResponse.status).toBe(201);
    const booking = await checkoutResponse.json();
    expect(booking.status).toBe("CONFIRMED");

    expect((await app.request(`/api/v1/me/trips/${booking.id}`)).status).toBe(401);
    const tripResponse = await app.request(`/api/v1/me/trips/${booking.id}`, { headers: { "x-demo-traveler": "bat@example.com" } });
    expect(tripResponse.status).toBe(200);
    const trip = await tripResponse.json();
    expect(trip.itinerary.every((event: { internalNote?: string }) => event.internalNote === undefined)).toBe(true);
  });

  it("publishes a newly created tour and departure through the admin boundary", async () => {
    const tourResponse = await app.request("/api/v1/admin/tours", {
      method: "POST",
      headers: ownerHeaders,
      body: JSON.stringify({ name: "Altai Eagle Journey", slug: "altai-eagle-journey", summary: "Western Mongolia expedition", description: "A seven-day small-group journey.", durationDays: 7, durationNights: 6, basePriceMinor: 4_250_000, currency: "MNT", destinations: ["Altai"] })
    });
    expect(tourResponse.status).toBe(201);
    const tour = await tourResponse.json();

    const departureResponse = await app.request("/api/v1/admin/departures", {
      method: "POST",
      headers: ownerHeaders,
      body: JSON.stringify({ tourId: tour.id, code: "AEJ-2026-10-03", startsOn: "2026-10-03", endsOn: "2026-10-09", capacity: 16, priceMinor: 4_250_000, currency: "MNT" })
    });
    expect(departureResponse.status).toBe(201);

    expect((await app.request(`/api/v1/admin/tours/${tour.id}/publish`, { method: "POST", headers: ownerHeaders })).status).toBe(200);
    const publicTour = await app.request("/api/v1/tours/altai-eagle-journey");
    expect(publicTour.status).toBe(200);
  });

  it("propagates a traveler-visible staff itinerary update to the traveler portal", async () => {
    const trips = await (await app.request("/api/v1/me/trips", { headers: { "x-demo-traveler": "bat@example.com" } })).json();
    const trip = await (await app.request(`/api/v1/me/trips/${trips.items[0].id}`, { headers: { "x-demo-traveler": "bat@example.com" } })).json();
    const event = trip.itinerary[0];

    const update = await app.request(`/api/v1/admin/departures/${trip.departure.id}/itinerary/${event.id}`, {
      method: "PATCH",
      headers: ownerHeaders,
      body: JSON.stringify({ eventId: event.id, title: "Airport meeting point updated", startsAt: event.startsAt, location: "Chinggis Khaan Airport, Terminal 2", details: "Meet beside information desk B.", visibility: "TRAVELER" })
    });
    expect(update.status).toBe(200);

    const refreshed = await (await app.request(`/api/v1/me/trips/${trip.id}`, { headers: { "x-demo-traveler": "bat@example.com" } })).json();
    expect(refreshed.itinerary[0].title).toBe("Airport meeting point updated");
  });
});

