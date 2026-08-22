import { auditLogs, outboxEvents, withUserRlsContext, type DatabaseClient, type VerifiedRlsClaims } from "@toms/db";
import { can } from "@toms/domain";
import type { Actor } from "../../shared/actor";
import { ApiError } from "../../shared/errors/api-error";
import { createDepartureSchema } from "./departure.schemas";
import { insertDeparture, listDepartures } from "./departure.repository";

function claims(actor: Actor): VerifiedRlsClaims {
  return { sub: actor.userId, role: "authenticated", iss: typeof actor.claims.iss === "string" ? actor.claims.iss : "", ...(actor.claims.aud ? { aud: actor.claims.aud as string | string[] } : {}), app_metadata: { tenant_id: actor.tenantId } };
}

export function createDepartureService(client: DatabaseClient) {
  const service = {
    async list(actor: Actor) {
      const rows = await withUserRlsContext(client.db, claims(actor), (tx) => listDepartures(tx, actor.tenantId));
      return { data: rows.map((row) => ({ ...row.departure, tourNameI18n: row.tourName, tourSlug: row.tourSlug })), pagination: { page: 1, pageSize: rows.length, total: rows.length, pageCount: rows.length > 0 ? 1 : 0 } };
    },
    async create(actor: Actor, rawInput: unknown) {
      if (!can(actor.role, "departure:operate")) throw new ApiError(403, "FORBIDDEN", "Departure operations permission is required");
      const input = createDepartureSchema.parse(rawInput);
      return withUserRlsContext(client.db, claims(actor), async (tx) => {
        const created = await insertDeparture(tx, { ...input, tenantId: actor.tenantId });
        if (!created) throw new ApiError(404, "TOUR_NOT_FOUND", "Tour not found");
        await tx.insert(auditLogs).values({ tenantId: actor.tenantId, actorUserId: actor.userId, action: "departure.created", entityType: "departure", entityId: created.id, after: created });
        await tx.insert(outboxEvents).values({ tenantId: actor.tenantId, eventType: "departure.created", aggregateType: "departure", aggregateId: created.id, deduplicationKey: `departure.created:${created.id}`, payload: { departureId: created.id, tourId: created.tourId } });
        return created;
      });
    },
    async get(actor: Actor, departureId: string) {
      const result = await service.list(actor);
      const departure = result.data.find((item) => item.id === departureId);
      if (!departure) throw new ApiError(404, "DEPARTURE_NOT_FOUND", "Departure not found");
      return departure;
    },
    async readiness(actor: Actor, departureId: string) {
      const departure = await service.get(actor, departureId);
      const occupancyPercent = Math.round(departure.confirmedCount / Math.max(departure.capacity, 1) * 100);
      return { departureId, overallPercent: occupancyPercent, checks: [{ id: "inventory", label: "Inventory", status: departure.confirmedCount > 0 ? "READY" : "ATTENTION", percent: occupancyPercent }] };
    },
    async manifest(actor: Actor, departureId: string) {
      await service.get(actor, departureId);
      return { departureId, items: [], summary: { travelers: 0, documentsReady: 0, visaAttention: 0 } };
    },
  };
  return service;
}
