import { withUserRlsContext, type DatabaseClient, type VerifiedRlsClaims } from "@toms/db";
import type { Actor } from "../../shared/actor";
import { readDashboard } from "./dashboard.repository";

function claims(actor: Actor): VerifiedRlsClaims {
  return { sub: actor.userId, role: "authenticated", iss: typeof actor.claims.iss === "string" ? actor.claims.iss : "", ...(actor.claims.aud ? { aud: actor.claims.aud as string | string[] } : {}), app_metadata: { tenant_id: actor.tenantId } };
}

export function createDashboardService(client: DatabaseClient) {
  return {
    async read(actor: Actor, locale: "mn" | "en") {
      const result = await withUserRlsContext(client.db, claims(actor), (tx) => readDashboard(tx, actor.tenantId));
      return {
        metrics: {
          grossBookingValueMinor: Number(result.bookingTotals?.grossBookingValueMinor ?? 0),
          confirmedBookings: result.bookingTotals?.confirmedBookings ?? 0,
          upcomingDepartures: result.departureTotals?.upcomingDepartures ?? 0,
          travelers: result.travelerTotals?.travelers ?? 0,
          storefrontConversion: 0,
        },
        revenueTrend: result.trend.map((item) => Number(item.value) / 1_000_000),
        bookingsByStatus: result.statuses,
        upcomingDepartures: result.upcoming.map((item) => ({ ...item, tourName: item.tourName[locale] })),
      };
    },
  };
}
