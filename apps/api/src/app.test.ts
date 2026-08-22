import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app";
import type { ApiServices } from "./services";

const request = (path: string, init?: RequestInit) => new Request(`http://localhost${path}`, init);

describe("TOMS Elysia application boundary", () => {
  it("serves health and OpenAPI with a request identifier", async () => {
    const app = createApp({ now: () => new Date("2026-08-21T09:00:00.000Z") });

    const health = await app.handle(request("/health"));
    expect(health.status).toBe(200);
    expect(health.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(health.json()).resolves.toMatchObject({ service: "toms-api", status: "ok", time: "2026-08-21T09:00:00.000Z" });

    const spec = await app.handle(request("/openapi/json"));
    expect(spec.status).toBe(200);
    const document = await spec.json() as { paths: Record<string, unknown> };
    expect(document.paths).toHaveProperty("/api/v1/admin/tours");
    expect(document.paths).toHaveProperty("/api/v1/storefront/bootstrap");
  });

  it("rejects protected routes when only legacy demo headers are supplied", async () => {
    const app = createApp();
    const response = await app.handle(request("/api/v1/admin/tours", {
      headers: { "x-demo-role": "OWNER", "x-demo-traveler": "bat@example.com" },
    }));

    expect(response.status).toBe(401);
    const body = await response.json() as { error: { code: string; requestId: string } };
    expect(body.error.code).toBe("AUTH_REQUIRED");
    expect(body.error.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("does not expose the generic resource API", async () => {
    const app = createApp();
    const response = await app.handle(request("/api/v1/admin/resources/tours"));
    expect(response.status).toBe(404);
  });

  it("serves the public catalog in the requested locale and host context", async () => {
    const bootstrap = vi.fn(async (host: string, locale: "mn" | "en") => ({ host, locale, featuredTours: [] }));
    const listTours = vi.fn(async (host: string, locale: "mn" | "en") => ({ items: [{ slug: "gobi", name: locale === "en" ? "Gobi" : "Говь" }], host }));
    const services = { storefront: { bootstrap, listTours, getTour: vi.fn() } } as unknown as ApiServices;
    const app = createApp({ services });

    const bootstrapResponse = await app.handle(request("/api/v1/storefront/bootstrap?locale=en", { headers: { host: "travel.example" } }));
    expect(bootstrapResponse.status).toBe(200);
    await expect(bootstrapResponse.json()).resolves.toMatchObject({ locale: "en", host: "travel.example" });
    expect(bootstrap).toHaveBeenCalledWith("travel.example", "en");

    const toursResponse = await app.handle(request("/api/v1/tours?locale=en", { headers: { host: "travel.example" } }));
    expect(toursResponse.status).toBe(200);
    await expect(toursResponse.json()).resolves.toMatchObject({ items: [{ slug: "gobi", name: "Gobi" }] });
  });

  it("requires and forwards idempotency keys for inventory holds and checkout", async () => {
    const createHold = vi.fn(async (_host: string, input: unknown, idempotencyKey: string) => ({ id: "hold-1", input, idempotencyKey }));
    const checkout = vi.fn(async (_host: string, input: unknown, idempotencyKey: string) => ({ id: "booking-1", organizerEmail: "traveler@example.com", input, idempotencyKey }));
    const services = { bookings: { createHold, checkout } } as unknown as ApiServices;
    const app = createApp({ services });

    const missingKey = await app.handle(request("/api/v1/booking-holds", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ departureId: "31111111-1111-4111-8111-111111111111", partySize: 2 }) }));
    expect(missingKey.status).toBe(400);

    const holdResponse = await app.handle(request("/api/v1/booking-holds", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": "hold-key-1", host: "travel.example" }, body: JSON.stringify({ departureId: "31111111-1111-4111-8111-111111111111", partySize: 2 }) }));
    expect(holdResponse.status).toBe(201);
    expect(createHold).toHaveBeenCalledWith("travel.example", expect.objectContaining({ partySize: 2 }), "hold-key-1");

    const checkoutResponse = await app.handle(request("/api/v1/checkout/sessions", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": "checkout-key-1", host: "travel.example" }, body: JSON.stringify({ holdId: "51111111-1111-4111-8111-111111111111", payer: { fullName: "Traveler One", email: "traveler@example.com" }, travelers: [{ fullName: "Traveler One", nationality: "MN" }], termsAccepted: true }) }));
    expect(checkoutResponse.status).toBe(201);
    expect(checkout).toHaveBeenCalledWith("travel.example", expect.objectContaining({ termsAccepted: true }), "checkout-key-1");
  });

  it("serves only the authenticated traveler's trips", async () => {
    const token = { userId: "81111111-1111-4111-8111-111111111111", claims: { sub: "81111111-1111-4111-8111-111111111111", iss: "https://auth.example" }, token: "signed-token" };
    const verifyAccessToken = vi.fn(async () => token);
    const list = vi.fn(async (_token: unknown, locale: "mn" | "en") => ({ items: [{ id: "booking-1", locale }] }));
    const services = { traveler: { list, get: vi.fn() } } as unknown as ApiServices;
    const app = createApp({ services, verifyAccessToken });

    const response = await app.handle(request("/api/v1/me/trips?locale=en", { headers: { authorization: "Bearer signed-token" } }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ items: [{ id: "booking-1", locale: "en" }] });
    expect(list).toHaveBeenCalledWith(token, "en");
  });

  it("publishes tours and creates departures through explicit protected routes", async () => {
    const token = { userId: "81111111-1111-4111-8111-111111111111", claims: { sub: "81111111-1111-4111-8111-111111111111" }, token: "signed-token" };
    const actor = { userId: token.userId, tenantId: "11111111-1111-4111-8111-111111111111", role: "OWNER", claims: token.claims } as const;
    const publish = vi.fn(async () => ({ id: "tour-1", status: "PUBLISHED" }));
    const createDeparture = vi.fn(async () => ({ id: "departure-1", status: "OPEN" }));
    const services = {
      identity: { resolveActor: vi.fn(async () => actor) },
      tours: { publish, list: vi.fn(), create: vi.fn() },
      departures: { create: createDeparture, list: vi.fn() },
    } as unknown as ApiServices;
    const app = createApp({ services, verifyAccessToken: vi.fn(async () => token) });

    const publishResponse = await app.handle(request("/api/v1/admin/tours/21111111-1111-4111-8111-111111111111/publish", { method: "POST", headers: { authorization: "Bearer signed-token" } }));
    expect(publishResponse.status).toBe(200);
    expect(publish).toHaveBeenCalledWith(actor, "21111111-1111-4111-8111-111111111111");

    const departureResponse = await app.handle(request("/api/v1/admin/departures", { method: "POST", headers: { authorization: "Bearer signed-token", "content-type": "application/json" }, body: JSON.stringify({ tourId: "21111111-1111-4111-8111-111111111111", code: "ALT-2026-12-01", startsOn: "2026-12-01", endsOn: "2026-12-08", capacity: 14, priceMinor: 4150000, currency: "MNT" }) }));
    expect(departureResponse.status).toBe(201);
    expect(createDeparture).toHaveBeenCalledWith(actor, expect.objectContaining({ capacity: 14 }));
  });

  it("exposes explicit tenant-protected back-office collection routes", async () => {
    const token = { userId: "81111111-1111-4111-8111-111111111111", claims: { sub: "81111111-1111-4111-8111-111111111111" }, token: "signed-token" };
    const actor = { userId: token.userId, tenantId: "11111111-1111-4111-8111-111111111111", role: "OWNER", claims: token.claims } as const;
    const list = vi.fn(async (_actor: unknown, resource: string, locale: "mn" | "en") => ({ data: [{ id: `${resource}-1`, locale }] }));
    const services = {
      identity: { resolveActor: vi.fn(async () => actor) },
      backoffice: { list },
    } as unknown as ApiServices;
    const app = createApp({ services, verifyAccessToken: vi.fn(async () => token) });

    for (const resource of ["bookings", "travelers", "customers", "conversations", "payments", "invoices", "documents", "promotions"] as const) {
      const response = await app.handle(request(`/api/v1/admin/${resource}`, { headers: { authorization: "Bearer signed-token", "x-toms-locale": "en" } }));
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ data: [{ id: `${resource}-1`, locale: "en" }] });
      expect(list).toHaveBeenCalledWith(actor, resource, "en");
    }
  });
});
