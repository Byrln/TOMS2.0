import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { bookingHoldRequestSchema, checkoutRequestSchema, itineraryUpdateSchema } from "@toms/contracts";
import { BookingConflictError, can, type StaffRole } from "@toms/domain";
import { assertDemoRole, type TomsRepository } from "./repository";

export interface AppDependencies {
  repository: TomsRepository;
  now?: () => Date;
}

const createTourSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().min(10),
  description: z.string().min(10),
  durationDays: z.number().int().positive(),
  durationNights: z.number().int().nonnegative(),
  basePriceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  destinations: z.array(z.string().min(2)).min(1)
});

const createDepartureSchema = z.object({
  tourId: z.uuid(),
  code: z.string().min(4),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  capacity: z.number().int().positive(),
  priceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3)
});

function travelerEmail(header: string | undefined): string {
  if (!header || !z.email().safeParse(header).success) throw new Error("UNAUTHORIZED");
  return header;
}

export function createApp(dependencies: AppDependencies) {
  const app = new Hono();
  const now = dependencies.now ?? (() => new Date());

  app.use("*", cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"], allowHeaders: ["Content-Type", "Authorization", "X-Demo-Role", "X-Demo-Traveler"], allowMethods: ["GET", "POST", "PATCH", "OPTIONS"] }));
  app.onError((error, context) => {
    if (error.message === "UNAUTHORIZED") return context.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
    if (error instanceof BookingConflictError) return context.json({ error: { code: "CONFLICT", message: error.message } }, 409);
    if (error instanceof z.ZodError) return context.json({ error: { code: "VALIDATION_ERROR", message: "Request validation failed", issues: error.issues } }, 422);
    return context.json({ error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } }, 500);
  });

  function roleFrom(context: { req: { header(name: string): string | undefined } }): StaffRole {
    return assertDemoRole(context.req.header("x-demo-role"));
  }

  app.get("/health", (context) => context.json({ service: "toms-api", status: "ok", time: now().toISOString() }));
  app.get("/api/v1/storefront/bootstrap", (context) => {
    const tours = dependencies.repository.listTours();
    return context.json({ tenant: dependencies.repository.tenant(), storefront: dependencies.repository.storefront(), featuredTours: tours.slice(0, 6) });
  });
  app.get("/api/v1/tours", (context) => context.json({ items: dependencies.repository.listTours(), total: dependencies.repository.listTours().length }));
  app.get("/api/v1/tours/:slug", (context) => {
    const selected = dependencies.repository.getTourBySlug(context.req.param("slug"));
    return selected ? context.json(selected) : context.json({ error: { code: "NOT_FOUND", message: "Tour not found" } }, 404);
  });
  app.post("/api/v1/booking-holds", async (context) => {
    const input = bookingHoldRequestSchema.parse(await context.req.json());
    return context.json(dependencies.repository.createHold(input, now()), 201);
  });
  app.post("/api/v1/checkout/sessions", async (context) => {
    const input = checkoutRequestSchema.parse(await context.req.json());
    return context.json(dependencies.repository.checkout(input, now()), 201);
  });

  app.get("/api/v1/me/trips", (context) => {
    const email = travelerEmail(context.req.header("x-demo-traveler"));
    const items = dependencies.repository.listTrips(email);
    return context.json({ items, total: items.length });
  });
  app.get("/api/v1/me/trips/:id", (context) => {
    const email = travelerEmail(context.req.header("x-demo-traveler"));
    const trip = dependencies.repository.getTrip(context.req.param("id"), email);
    if (!trip) return context.json({ error: { code: "NOT_FOUND", message: "Trip not found" } }, 404);
    return context.json({ ...trip.booking, tour: trip.tour, departure: trip.departure, itinerary: trip.itinerary });
  });

  app.get("/api/v1/admin/dashboard", (context) => {
    roleFrom(context);
    return context.json(dependencies.repository.dashboard());
  });
  app.get("/api/v1/admin/resources/:resource", (context) => {
    roleFrom(context);
    const items = dependencies.repository.resources(context.req.param("resource"));
    return context.json({ items, total: items.length });
  });
  app.post("/api/v1/admin/tours", async (context) => {
    const role = roleFrom(context);
    if (!can(role, "tour:write")) throw new Error("UNAUTHORIZED");
    return context.json(dependencies.repository.createTour(createTourSchema.parse(await context.req.json())), 201);
  });
  app.post("/api/v1/admin/departures", async (context) => {
    const role = roleFrom(context);
    if (!can(role, "departure:operate")) throw new Error("UNAUTHORIZED");
    return context.json(dependencies.repository.createDeparture(createDepartureSchema.parse(await context.req.json())), 201);
  });
  app.post("/api/v1/admin/tours/:id/publish", (context) => {
    const role = roleFrom(context);
    if (!can(role, "storefront:publish")) throw new Error("UNAUTHORIZED");
    return context.json(dependencies.repository.publishTour(context.req.param("id")));
  });
  app.patch("/api/v1/admin/departures/:departureId/itinerary/:eventId", async (context) => {
    const role = roleFrom(context);
    if (!can(role, "departure:operate")) throw new Error("UNAUTHORIZED");
    const input = itineraryUpdateSchema.parse(await context.req.json());
    if (input.eventId !== context.req.param("eventId")) throw new BookingConflictError("Event identifier mismatch");
    return context.json(dependencies.repository.updateItinerary(context.req.param("departureId"), context.req.param("eventId"), input));
  });

  return app;
}
