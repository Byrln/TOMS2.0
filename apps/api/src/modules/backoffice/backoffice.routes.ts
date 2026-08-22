import { Elysia } from "elysia";
import type { ApiServices } from "../../services";
import type { VerifyAccessToken } from "../../plugins/auth.plugin";
import { ApiError } from "../../shared/errors/api-error";
import type { BackofficeResource } from "./backoffice.repository";
import { collectionQuerySchema } from "@toms/contracts";

export function backofficeModule(services: ApiServices | undefined, verifyAccessToken: VerifyAccessToken) {
  const list = async (request: Request, resource: BackofficeResource, query: Record<string, unknown>) => {
    const token = await verifyAccessToken(request.headers.get("authorization"));
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    const actor = await services.identity.resolveActor(token);
    return services.backoffice.list(actor, resource, request.headers.get("x-toms-locale") === "en" ? "en" : "mn", collectionQuerySchema.parse(query));
  };

  return new Elysia({ name: "module.backoffice", prefix: "/api/v1/admin" })
    .get("/bookings", ({ request, query }) => list(request, "bookings", query), { detail: { tags: ["Bookings"], summary: "List bookings" } })
    .get("/travelers", ({ request, query }) => list(request, "travelers", query), { detail: { tags: ["Travelers"], summary: "List travelers" } })
    .get("/customers", ({ request, query }) => list(request, "customers", query), { detail: { tags: ["Identity"], summary: "List customers" } })
    .get("/conversations", ({ request, query }) => list(request, "conversations", query), { detail: { tags: ["Messaging"], summary: "List conversations" } })
    .get("/payments", ({ request, query }) => list(request, "payments", query), { detail: { tags: ["Finance"], summary: "List payments" } })
    .get("/invoices", ({ request, query }) => list(request, "invoices", query), { detail: { tags: ["Finance"], summary: "List invoices" } })
    .get("/documents", ({ request, query }) => list(request, "documents", query), { detail: { tags: ["Documents"], summary: "List documents" } })
    .get("/promotions", ({ request, query }) => list(request, "promotions", query), { detail: { tags: ["Promotions"], summary: "List promotions" } });
}
