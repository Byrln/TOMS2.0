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
          grossBookingValue: { amountMinor: Number(result.bookingTotals?.grossBookingValueMinor ?? 0), currency: "MNT" },
          confirmedBookings: result.bookingTotals?.confirmedBookings ?? 0,
          upcomingDepartures: result.departureTotals?.upcomingDepartures ?? 0,
          travelers: result.travelerTotals?.travelers ?? 0,
          averageBookingValue: { amountMinor: Number(result.bookingTotals?.averageBookingValueMinor ?? 0), currency: "MNT" },
        },
        trend: result.trend.map((item) => ({ period: item.month, bookingValueMinor: Number(item.value), bookingCount: item.bookingCount })),
        departureHealth: {
          ready: result.upcoming.filter((item) => item.status === "GUARANTEED").length,
          attention: result.upcoming.filter((item) => item.status === "OPEN").length,
          atRisk: result.upcoming.filter((item) => item.confirmedCount / Math.max(item.capacity, 1) < 0.4).length,
          averageOccupancyPercent: result.upcoming.length === 0 ? 0 : Math.round(result.upcoming.reduce((sum, item) => sum + item.confirmedCount / Math.max(item.capacity, 1) * 100, 0) / result.upcoming.length),
        },
        risks: [],
        bookingsByStatus: result.statuses,
        upcomingDepartures: result.upcoming.map((item) => ({ ...item, tourName: item.tourName[locale], readinessPercent: Math.round(item.confirmedCount / Math.max(item.capacity, 1) * 100), riskCount: 0 })),
        recentBookings: result.recentBookings.map((item) => ({ ...item, totalMinor: Number(item.totalMinor), tourName: item.tourName[locale] })),
      };
    },
  };
}
