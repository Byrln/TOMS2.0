import { Elysia } from "elysia";
import type { VerifyAccessToken } from "../../plugins/auth.plugin";
import type { ApiServices } from "../../services";
import { ApiError } from "../../shared/errors/api-error";

export function dashboardModule(services: ApiServices | undefined, verifyAccessToken: VerifyAccessToken) {
  return new Elysia({ name: "module.dashboard" }).get("/api/v1/admin/dashboard", async ({ request }) => {
    const token = await verifyAccessToken(request.headers.get("authorization"));
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    const actor = await services.identity.resolveActor(token);
    return services.dashboard.read(actor, request.headers.get("x-toms-locale") === "en" ? "en" : "mn");
  }, { detail: { tags: ["Operations"], summary: "Operational KPI dashboard" } });
}
