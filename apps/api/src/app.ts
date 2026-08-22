import { randomUUID } from "node:crypto";
import { cors } from "@elysia/cors";
import { openapi } from "@elysia/openapi";
import { Elysia, type ElysiaAdapter } from "elysia";
import { z } from "zod";
import { requestContextPlugin } from "./plugins/request-context.plugin";
import { observabilityPlugin } from "./plugins/observability.plugin";
import { bearerToken, type VerifyAccessToken } from "./plugins/auth.plugin";
import type { ApiServices } from "./services";
import { storefrontModule } from "./modules/storefront/storefront.routes";
import { toursModule } from "./modules/tours/tours.routes";
import { bookingModule } from "./modules/bookings/booking.routes";
import { travelerModule } from "./modules/traveler/traveler.routes";
import { departureModule } from "./modules/departures/departure.routes";
import { dashboardModule } from "./modules/dashboard/dashboard.routes";
import { backofficeModule } from "./modules/backoffice/backoffice.routes";
import { ApiError, errorBody } from "./shared/errors/api-error";

export interface CreateAppOptions {
  adapter?: ElysiaAdapter;
  now?: () => Date;
  services?: ApiServices;
  verifyAccessToken?: VerifyAccessToken;
  logLevel?: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
}

const rejectUnconfiguredToken: VerifyAccessToken = async (authorization) => {
  bearerToken(authorization);
  throw new ApiError(503, "SERVICE_UNAVAILABLE", "JWT verification is not configured");
};

export function createApp(options: CreateAppOptions = {}) {
  const now = options.now ?? (() => new Date());
  const verifyAccessToken = options.verifyAccessToken ?? rejectUnconfiguredToken;

  return new Elysia({
    name: "toms-api",
    allowUnsafeValidationDetails: false,
    ...(options.adapter ? { adapter: options.adapter } : {}),
  })
    .use(cors({
      origin: [/^https?:\/\/(localhost|127\.0\.0\.1):(3000|3001)$/],
      allowedHeaders: ["authorization", "content-type", "idempotency-key", "x-request-id", "x-toms-locale", "x-toms-storefront-host"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }))
    .use(requestContextPlugin)
    .use(observabilityPlugin(options.logLevel ?? (process.env.NODE_ENV === "test" ? "silent" : "info")))
    .use(openapi({
      path: "/openapi",
      documentation: {
        info: { title: "TOMS API", version: "1.0.0", description: "Travel Operations OS API" },
        tags: [
          { name: "Identity" },
          { name: "Tours" },
          { name: "Departures" },
          { name: "Inventory" },
          { name: "Bookings" },
          { name: "Travelers" },
          { name: "Operations" },
          { name: "Finance" },
          { name: "Documents" },
          { name: "Storefront" },
          { name: "CMS" },
          { name: "Promotions" },
        ],
      },
    }))
    .onError(({ error, code, set, request }) => {
      const requestId = request.headers.get("x-request-id") ?? randomUUID();
      set.headers["x-request-id"] = requestId;
      if (error instanceof ApiError) {
        set.status = error.status;
        return errorBody(error, requestId);
      }
      if (error instanceof z.ZodError || code === "VALIDATION") {
        set.status = 422;
        return errorBody(new ApiError(422, "VALIDATION_FAILED", "Request validation failed"), requestId);
      }
      if (code === "NOT_FOUND") {
        set.status = 404;
        return { error: { code: "NOT_FOUND", message: "Route not found", requestId } };
      }
      set.status = 500;
      return errorBody(new ApiError(500, "INTERNAL_ERROR", "Unexpected server error"), requestId);
    })
    .get("/health", ({ set }) => {
      if (!set.headers["x-request-id"]) set.headers["x-request-id"] = randomUUID();
      return { service: "toms-api", status: "ok", time: now().toISOString() };
    }, { detail: { summary: "Health check" } })
    .use(storefrontModule(options.services))
    .use(bookingModule(options.services))
    .use(travelerModule(options.services, verifyAccessToken))
    .use(departureModule(options.services, verifyAccessToken))
    .use(dashboardModule(options.services, verifyAccessToken))
    .use(backofficeModule(options.services, verifyAccessToken))
    .use(toursModule(options.services, verifyAccessToken));
}

export type App = ReturnType<typeof createApp>;
