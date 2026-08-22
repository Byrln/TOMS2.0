import { Elysia } from "elysia";
import type { VerifyAccessToken } from "../../plugins/auth.plugin";
import type { ApiServices } from "../../services";
import { ApiError } from "../../shared/errors/api-error";
import { createDepartureSchema } from "./departure.schemas";

export function departureModule(services: ApiServices | undefined, verifyAccessToken: VerifyAccessToken) {
  const authenticate = async (headers: Headers) => {
    const token = await verifyAccessToken(headers.get("authorization"));
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    return services.identity.resolveActor(token);
  };
  return new Elysia({ name: "module.departures", prefix: "/api/v1/admin/departures" })
    .get("", async ({ request }) => services!.departures.list(await authenticate(request.headers)), { detail: { tags: ["Departures"], summary: "List departures" } })
    .post("", async ({ request, body, set }) => {
      const result = await services!.departures.create(await authenticate(request.headers), createDepartureSchema.parse(body));
      set.status = 201;
      return result;
    }, { detail: { tags: ["Departures"], summary: "Create a departure" } });
}
