import { Elysia } from "elysia";
import type { ApiServices } from "../../services";
import type { VerifyAccessToken } from "../../plugins/auth.plugin";
import { ApiError } from "../../shared/errors/api-error";
import type { BackofficeResource } from "./backoffice.repository";

export function backofficeModule(services: ApiServices | undefined, verifyAccessToken: VerifyAccessToken) {
  const list = async (request: Request, resource: BackofficeResource) => {
    const token = await verifyAccessToken(request.headers.get("authorization"));
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    const actor = await services.identity.resolveActor(token);
    return services.backoffice.list(actor, resource, request.headers.get("x-toms-locale") === "en" ? "en" : "mn");
  };

  return new Elysia({ name: "module.backoffice", prefix: "/api/v1/admin" })
    .get("/bookings", ({ request }) => list(request, "bookings"), { detail: { tags: ["Bookings"], summary: "List bookings" } })
    .get("/travelers", ({ request }) => list(request, "travelers"), { detail: { tags: ["Travelers"], summary: "List travelers" } })
    .get("/customers", ({ request }) => list(request, "customers"), { detail: { tags: ["Identity"], summary: "List customers" } })
    .get("/conversations", ({ request }) => list(request, "conversations"), { detail: { tags: ["Messaging"], summary: "List conversations" } })
    .get("/payments", ({ request }) => list(request, "payments"), { detail: { tags: ["Finance"], summary: "List payments" } })
    .get("/invoices", ({ request }) => list(request, "invoices"), { detail: { tags: ["Finance"], summary: "List invoices" } })
    .get("/documents", ({ request }) => list(request, "documents"), { detail: { tags: ["Documents"], summary: "List documents" } })
    .get("/promotions", ({ request }) => list(request, "promotions"), { detail: { tags: ["Promotions"], summary: "List promotions" } });
}
