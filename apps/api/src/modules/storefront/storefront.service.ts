import { withAnonymousRlsContext, type DatabaseClient } from "@toms/db";
import { ApiError } from "../../shared/errors/api-error";
import { readPublishedStorefront } from "./storefront.repository";

export function createStorefrontService(client: DatabaseClient) {
  const load = async (host: string, locale: "mn" | "en") => {
    const result = await withAnonymousRlsContext(client.db, (tx) => readPublishedStorefront(tx, host, locale));
    if (!result) throw new ApiError(404, "TENANT_NOT_FOUND", "Published storefront not found");
    return result;
  };
  return {
    bootstrap: load,
    async listTours(host: string, locale: "mn" | "en") {
      const result = await load(host, locale);
      return { items: result.featuredTours };
    },
    async getTour(host: string, slug: string, locale: "mn" | "en") {
      const result = await load(host, locale);
      const tour = result.featuredTours.find((item) => item.slug === slug);
      if (!tour) throw new ApiError(404, "TOUR_NOT_FOUND", "Published tour not found");
      return tour;
    },
  };
}
