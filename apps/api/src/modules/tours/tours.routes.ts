import { Elysia } from "elysia";
import type { ApiServices } from "../../services";
import type { VerifyAccessToken } from "../../plugins/auth.plugin";
import { ApiError } from "../../shared/errors/api-error";
import { createTourInputSchema, tourListQuerySchema } from "./tours.schemas";

export function toursModule(services: ApiServices | undefined, verifyAccessToken: VerifyAccessToken) {
  const authenticate = async (headers: Headers) => {
    const token = await verifyAccessToken(headers.get("authorization"));
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    return services.identity.resolveActor(token);
  };

  return new Elysia({ name: "module.tours", prefix: "/api/v1/admin/tours" })
    .get("", async ({ request, query }) => {
      const actor = await authenticate(request.headers);
      const parsed = tourListQuerySchema.parse(query);
      const locale = request.headers.get("x-toms-locale") === "en" ? "en" as const : "mn" as const;
      return services!.tours.list(actor, { ...parsed, locale });
    }, { detail: { tags: ["Tours"], summary: "List tours" } })
    .post("", async ({ request, body, set }) => {
      const actor = await authenticate(request.headers);
      const result = await services!.tours.create(actor, createTourInputSchema.parse(body));
      set.status = 201;
      return result;
    }, { detail: { tags: ["Tours"], summary: "Create a tour" } })
    .get("/:id", async ({ request, params }) => {
      const actor = await authenticate(request.headers);
      return services!.tours.get(actor, params.id, request.headers.get("x-toms-locale") === "en" ? "en" : "mn");
    }, { detail: { tags: ["Tours"], summary: "Read a tour" } })
    .post("/:id/publish", async ({ request, params }) => {
      const actor = await authenticate(request.headers);
      return services!.tours.publish(actor, params.id);
    }, { detail: { tags: ["Tours", "Storefront"], summary: "Publish a tour" } });
}
