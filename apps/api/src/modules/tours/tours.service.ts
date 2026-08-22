import { auditLogs, outboxEvents, withUserRlsContext, type DatabaseClient, type LocalizedText, type VerifiedRlsClaims } from "@toms/db";
import { can } from "@toms/domain";
import type { Actor } from "../../shared/actor";
import { ApiError } from "../../shared/errors/api-error";
import type { PageQuery } from "../../services";
import { insertTour, listTours, publishTour, readTour } from "./tours.repository";

export interface CreateTourInput {
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  category: string;
  durationDays: number;
  durationNights: number;
  destinations: string[];
  languages: Array<"mn" | "en">;
  basePriceMinor: number;
  currency: string;
}

function actorClaims(actor: Actor): VerifiedRlsClaims {
  return {
    sub: actor.userId,
    role: "authenticated",
    iss: typeof actor.claims.iss === "string" ? actor.claims.iss : "",
    ...(actor.claims.aud ? { aud: actor.claims.aud as string | string[] } : {}),
    app_metadata: { tenant_id: actor.tenantId },
  };
}

export function createToursService(client: DatabaseClient) {
  return {
    async list(actor: Actor, query: PageQuery) {
      const result = await withUserRlsContext(client.db, actorClaims(actor), (tx) => listTours(tx, actor.tenantId, query));
      const locale = query.locale ?? "mn";
      return { ...result, data: result.data.map((tour) => ({ ...tour, nameI18n: tour.name, name: tour.name[locale] })) };
    },
    async create(actor: Actor, rawInput: unknown) {
      if (!can(actor.role, "tour:write")) throw new ApiError(403, "FORBIDDEN", "Tour write permission is required");
      const input = rawInput as CreateTourInput;
      return withUserRlsContext(client.db, actorClaims(actor), async (tx) => {
        const created = await insertTour(tx, { ...input, tenantId: actor.tenantId });
        await tx.insert(auditLogs).values({
          tenantId: actor.tenantId,
          actorUserId: actor.userId,
          action: "tour.created",
          entityType: "tour",
          entityId: created.id,
          after: created,
        });
        await tx.insert(outboxEvents).values({
          tenantId: actor.tenantId,
          eventType: "tour.created",
          aggregateType: "tour",
          aggregateId: created.id,
          deduplicationKey: `tour.created:${created.id}`,
          payload: { tourId: created.id },
        });
        return created;
      });
    },
    async publish(actor: Actor, tourId: string) {
      if (!can(actor.role, "storefront:publish")) throw new ApiError(403, "FORBIDDEN", "Storefront publish permission is required");
      return withUserRlsContext(client.db, actorClaims(actor), async (tx) => {
        const publishedAt = new Date();
        const published = await publishTour(tx, actor.tenantId, tourId, publishedAt);
        if (!published) throw new ApiError(404, "TOUR_NOT_FOUND", "Tour not found");
        await tx.insert(auditLogs).values({ tenantId: actor.tenantId, actorUserId: actor.userId, action: "tour.published", entityType: "tour", entityId: tourId, after: published });
        await tx.insert(outboxEvents).values({ tenantId: actor.tenantId, eventType: "tour.published", aggregateType: "tour", aggregateId: tourId, deduplicationKey: `tour.published:${tourId}:${publishedAt.toISOString()}`, payload: { tourId } });
        return published;
      });
    },
    async get(actor: Actor, tourId: string, locale: "mn" | "en") {
      const result = await withUserRlsContext(client.db, actorClaims(actor), (tx) => readTour(tx, actor.tenantId, tourId));
      if (!result) throw new ApiError(404, "TOUR_NOT_FOUND", "Tour not found");
      const basePrice = result.prices.find((price) => price.departureId === null) ?? result.prices[0];
      return {
        ...result.tour,
        name: result.tour.nameI18n[locale],
        summary: result.tour.summaryI18n[locale],
        description: result.tour.descriptionI18n[locale],
        heroImageUrl: result.tour.heroImagePath ?? "/images/altai.png",
        basePriceMinor: Number(basePrice?.amountMinor ?? 0n),
        currency: basePrice?.currency ?? "MNT",
        departures: result.departures.map((departure) => {
          const price = result.prices.find((item) => item.departureId === departure.id) ?? basePrice;
          return { ...departure, priceMinor: Number(price?.amountMinor ?? 0n), currency: price?.currency ?? "MNT" };
        }),
      };
    },
  };
}
