import { withAnonymousRlsContext, type DatabaseClient } from "@toms/db";
import { ApiError } from "../../shared/errors/api-error";
import { readPublishedStorefront } from "./storefront.repository";
import type { PageQuery } from "../../services";

export function createStorefrontService(client: DatabaseClient) {
  const load = async (host: string, locale: "mn" | "en") => {
    const result = await withAnonymousRlsContext(client.db, (tx) => readPublishedStorefront(tx, host, locale));
    if (!result) throw new ApiError(404, "TENANT_NOT_FOUND", "Published storefront not found");
    return result;
  };
  return {
    bootstrap: load,
    async home(host: string, locale: "mn" | "en") {
      const result = await load(host, locale);
      return {
        hero: { title: result.storefront.brandName, image: result.featuredTours[0]?.heroImageUrl ?? "/images/altai.png" },
        featuredTours: result.featuredTours,
        featuredDestinations: [...new Set(result.featuredTours.flatMap((tour) => tour.destinations))],
        promotion: result.storefront.promotions[0] ?? null,
      };
    },
    async listTours(host: string, locale: "mn" | "en", query?: PageQuery) {
      const result = await load(host, locale);
      const normalizedQuery = query?.q?.toLocaleLowerCase();
      const filtered = normalizedQuery
        ? result.featuredTours.filter((tour) => [tour.name, tour.summary, ...tour.destinations].join(" ").toLocaleLowerCase().includes(normalizedQuery))
        : result.featuredTours;
      const pageNumber = query?.page ?? 1;
      const pageSize = query?.pageSize ?? 25;
      return { items: filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), page: { page: pageNumber, pageSize, total: filtered.length, pageCount: Math.ceil(filtered.length / pageSize) } };
    },
    async getTour(host: string, slug: string, locale: "mn" | "en") {
      const result = await load(host, locale);
      const tour = result.featuredTours.find((item) => item.slug === slug);
      if (!tour) throw new ApiError(404, "TOUR_NOT_FOUND", "Published tour not found");
      return tour;
    },
    async listDestinations(host: string, locale: "mn" | "en", query?: PageQuery) {
      const result = await load(host, locale);
      const values = [...new Set(result.featuredTours.flatMap((tour) => tour.destinations))];
      const items = values.map((name, index) => ({ id: `${result.tenant.id}:${name}`, slug: name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, ""), name, region: "Mongolia & Beyond", summary: locale === "mn" ? `${name} чиглэлийн аяллууд` : `Journeys through ${name}`, image: { url: result.featuredTours.find((tour) => tour.destinations.includes(name))?.heroImageUrl ?? "/images/altai.png", alt: name }, tourCount: result.featuredTours.filter((tour) => tour.destinations.includes(name)).length, featured: index < 4 }));
      const pageNumber = query?.page ?? 1; const pageSize = query?.pageSize ?? 25;
      return { items: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), page: { page: pageNumber, pageSize, total: items.length, pageCount: Math.ceil(items.length / pageSize) }, regions: [...new Set(items.map((item) => item.region))] };
    },
    async getDestination(host: string, slug: string, locale: "mn" | "en") {
      const list = await this.listDestinations(host, locale, { page: 1, pageSize: 100 });
      const destination = list.items.find((item) => item.slug === slug);
      if (!destination) throw new ApiError(404, "DESTINATION_NOT_FOUND", "Published destination not found");
      return destination;
    },
    async getDeparture(host: string, departureId: string, locale: "mn" | "en") {
      const result = await load(host, locale);
      for (const tour of result.featuredTours) {
        const departure = tour.departures.find((item) => item.id === departureId);
        if (departure) return { ...departure, tour };
      }
      throw new ApiError(404, "DEPARTURE_NOT_FOUND", "Published departure not found");
    },
    async availability(host: string, departureId: string, locale: "mn" | "en") {
      const departure = await this.getDeparture(host, departureId, locale);
      return { departureId, capacity: departure.capacity, confirmed: departure.confirmedCount, held: departure.heldCount, remaining: Math.max(0, departure.capacity - departure.confirmedCount - departure.heldCount) };
    },
    async checkoutContext(host: string, departureId: string, locale: "mn" | "en") {
      const departure = await this.getDeparture(host, departureId, locale);
      return { holdPolicy: { durationMinutes: 15 }, tour: { slug: departure.tour.slug, name: departure.tour.name, heroImageUrl: departure.tour.heroImageUrl }, departure: { id: departure.id, startsOn: departure.startsOn, endsOn: departure.endsOn, remainingCapacity: Math.max(0, departure.capacity - departure.confirmedCount - departure.heldCount) }, pricing: { currency: departure.currency, perTravelerMinor: departure.priceMinor, feesMinor: 0, eligiblePromotions: [] }, requirements: { travelerFields: ["fullName", "nationality", "dateOfBirth", "dietaryRequirements", "specialRequirements"] }, paymentMethods: ["QPAY", "STRIPE"] };
    },
    async promotions(host: string, locale: "mn" | "en", query?: PageQuery) {
      const result = await load(host, locale); const pageNumber = query?.page ?? 1; const pageSize = query?.pageSize ?? 25;
      return { items: result.storefront.promotions.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), page: { page: pageNumber, pageSize, total: result.storefront.promotions.length, pageCount: Math.ceil(result.storefront.promotions.length / pageSize) } };
    },
    async page(host: string, slug: string, locale: "mn" | "en") {
      void host; void slug; void locale;
      throw new ApiError(404, "PAGE_NOT_FOUND", "Published CMS page not found");
    },
  };
}
