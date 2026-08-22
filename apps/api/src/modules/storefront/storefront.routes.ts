import { Elysia } from "elysia";
import type { ApiServices } from "../../services";
import { ApiError } from "../../shared/errors/api-error";
import { requestHost } from "../../shared/request-host";
import { collectionQuerySchema } from "@toms/contracts";

const localeFrom = (value: unknown) => value === "en" ? "en" as const : "mn" as const;
const collectionQueryFrom = (query: Record<string, unknown>) => {
  const collectionQuery = { ...query };
  delete collectionQuery.locale;
  return collectionQuerySchema.parse(collectionQuery);
};

export function storefrontModule(services: ApiServices | undefined) {
  const requireServices = () => {
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    return services;
  };
  return new Elysia({ name: "module.storefront" })
    .get("/api/v1/storefront/bootstrap", ({ request, query }) => (
      requireServices().storefront.bootstrap(requestHost(request.headers), localeFrom(query.locale))
    ), { detail: { tags: ["Storefront"], summary: "Published storefront bootstrap" } })
    .get("/api/v1/storefront/home", ({ request, query }) => (
      requireServices().storefront.home(requestHost(request.headers), localeFrom(query.locale))
    ), { detail: { tags: ["Storefront"], summary: "Published Storefront home composition" } })
    .get("/api/v1/storefront/tours", ({ request, query }) => (
      requireServices().storefront.listTours(requestHost(request.headers), localeFrom(query.locale), collectionQueryFrom(query))
    ), { detail: { tags: ["Storefront", "Tours"], summary: "Search published tours" } })
    .get("/api/v1/storefront/tours/:slug", ({ request, params, query }) => (
      requireServices().storefront.getTour(requestHost(request.headers), params.slug, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Tours"], summary: "Read a published tour" } })
    .get("/api/v1/storefront/destinations", ({ request, query }) => (
      requireServices().storefront.listDestinations(requestHost(request.headers), localeFrom(query.locale), collectionQueryFrom(query))
    ), { detail: { tags: ["Storefront"], summary: "List published destinations" } })
    .get("/api/v1/storefront/destinations/:slug", ({ request, params, query }) => (
      requireServices().storefront.getDestination(requestHost(request.headers), params.slug, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront"], summary: "Read a destination" } })
    .get("/api/v1/storefront/departures/:id", ({ request, params, query }) => (
      requireServices().storefront.getDeparture(requestHost(request.headers), params.id, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Departures"], summary: "Read a published departure" } })
    .get("/api/v1/storefront/departures/:id/availability", ({ request, params, query }) => (
      requireServices().storefront.availability(requestHost(request.headers), params.id, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Inventory"], summary: "Read live departure availability" } })
    .get("/api/v1/storefront/departures/:id/checkout-context", ({ request, params, query }) => (
      requireServices().storefront.checkoutContext(requestHost(request.headers), params.id, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Bookings"], summary: "Read checkout context" } })
    .get("/api/v1/storefront/promotions", ({ request, query }) => (
      requireServices().storefront.promotions(requestHost(request.headers), localeFrom(query.locale), collectionQueryFrom(query))
    ), { detail: { tags: ["Storefront", "Promotions"], summary: "List active Storefront promotions" } })
    .get("/api/v1/storefront/pages/:slug", ({ request, params, query }) => (
      requireServices().storefront.page(requestHost(request.headers), params.slug, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "CMS"], summary: "Read a published CMS page" } })
    .get("/api/v1/tours", ({ request, query }) => (
      requireServices().storefront.listTours(requestHost(request.headers), localeFrom(query.locale), collectionQueryFrom(query))
    ), { detail: { tags: ["Storefront", "Tours"], summary: "Published tour catalog" } })
    .get("/api/v1/tours/:slug", ({ request, params, query }) => (
      requireServices().storefront.getTour(requestHost(request.headers), params.slug, localeFrom(query.locale))
    ), { detail: { tags: ["Storefront", "Tours"], summary: "Published tour detail" } });
}
