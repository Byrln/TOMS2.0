import { Elysia } from "elysia";
import type { ApiServices } from "../../services";
import { ApiError } from "../../shared/errors/api-error";
import { requestHost } from "../../shared/request-host";

const localeFrom = (value: unknown) => value === "en" ? "en" as const : "mn" as const;

export function storefrontModule(services: ApiServices | undefined) {
  const requireServices = () => {
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    return services;
  };
  return new Elysia({ name: "module.storefront" })
    .get("/api/v1/storefront/bootstrap", ({ request, query }) => (
      requireServices().storefront.bootstrap(requestHost(request.headers), localeFrom(query.locale))
    ), { detail: { tags: ["Storefront"], summary: "Published storefront bootstrap" } })
    .get("/api/v1/tours", ({ request, query }) => (
      requireServices().storefront.listTours(requestHost(request.headers), localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Tours"], summary: "Published tour catalog" } })
    .get("/api/v1/tours/:slug", ({ request, params, query }) => (
      requireServices().storefront.getTour(requestHost(request.headers), params.slug, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Tours"], summary: "Published tour detail" } });
}
