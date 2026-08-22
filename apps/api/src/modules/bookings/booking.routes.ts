import { Elysia } from "elysia";
import type { ApiServices } from "../../services";
import { ApiError } from "../../shared/errors/api-error";
import { requestHost } from "../../shared/request-host";
import { checkoutSchema, createHoldSchema } from "./booking.schemas";

function idempotencyKey(headers: Headers): string {
  const value = headers.get("idempotency-key")?.trim();
  if (!value || value.length < 8 || value.length > 160) throw new ApiError(400, "IDEMPOTENCY_KEY_REQUIRED", "A valid Idempotency-Key header is required");
  return value;
}

export function bookingModule(services: ApiServices | undefined) {
  const requireServices = () => {
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    return services;
  };
  return new Elysia({ name: "module.bookings" })
    .post("/api/v1/booking-holds", async ({ request, body, set }) => {
      const result = await requireServices().bookings.createHold(requestHost(request.headers), createHoldSchema.parse(body), idempotencyKey(request.headers));
      set.status = 201;
      return result;
    }, { detail: { tags: ["Inventory", "Bookings"], summary: "Create an atomic inventory hold" } })
    .post("/api/v1/checkout/sessions", async ({ request, body, set }) => {
      const result = await requireServices().bookings.checkout(requestHost(request.headers), checkoutSchema.parse(body), idempotencyKey(request.headers));
      set.status = 201;
      return result;
    }, { detail: { tags: ["Bookings"], summary: "Create a booking from an active hold" } });
}
