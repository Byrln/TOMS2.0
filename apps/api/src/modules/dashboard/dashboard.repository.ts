import { and, asc, count, eq, gte, inArray, sql } from "drizzle-orm";
import { bookings, departures, tourDefinitions, travelerProfiles, type TomsTransaction } from "@toms/db";

export async function readDashboard(tx: TomsTransaction, tenantId: string) {
  const now = new Date();
  const [bookingTotals, departureTotals, travelerTotals, statuses, upcoming, trend, recentBookings] = await Promise.all([
    tx.select({ grossBookingValueMinor: sql<string>`coalesce(sum(${bookings.totalMinor}), 0)`, averageBookingValueMinor: sql<string>`coalesce(avg(${bookings.totalMinor}), 0)`, confirmedBookings: count() }).from(bookings).where(and(eq(bookings.tenantId, tenantId), eq(bookings.status, "CONFIRMED"))),
    tx.select({ upcomingDepartures: count() }).from(departures).where(and(eq(departures.tenantId, tenantId), gte(departures.startsOn, now.toISOString().slice(0, 10)), inArray(departures.status, ["OPEN", "GUARANTEED"]))),
    tx.select({ travelers: count() }).from(travelerProfiles).where(eq(travelerProfiles.tenantId, tenantId)),
    tx.select({ status: bookings.status, count: count() }).from(bookings).where(eq(bookings.tenantId, tenantId)).groupBy(bookings.status),
    tx.select({ id: departures.id, code: departures.code, startsOn: departures.startsOn, confirmedCount: departures.confirmedCount, capacity: departures.capacity, status: departures.status, tourName: tourDefinitions.nameI18n })
      .from(departures).innerJoin(tourDefinitions, eq(tourDefinitions.id, departures.tourId))
      .where(and(eq(departures.tenantId, tenantId), gte(departures.startsOn, now.toISOString().slice(0, 10))))
      .orderBy(asc(departures.startsOn)).limit(8),
    tx.select({ month: sql<string>`to_char(date_trunc('month', ${bookings.createdAt}), 'YYYY-MM')`, value: sql<string>`coalesce(sum(${bookings.totalMinor}), 0)`, bookingCount: count() })
      .from(bookings).where(and(eq(bookings.tenantId, tenantId), gte(bookings.createdAt, sql`now() - interval '12 months'`)))
      .groupBy(sql`date_trunc('month', ${bookings.createdAt})`).orderBy(sql`date_trunc('month', ${bookings.createdAt})`),
    tx.select({ id: bookings.id, bookingNumber: bookings.bookingNumber, customerName: bookings.organizerEmail, tourName: tourDefinitions.nameI18n, totalMinor: bookings.totalMinor, currency: bookings.currency, status: bookings.status, paymentStatus: bookings.paymentStatus })
      .from(bookings).innerJoin(tourDefinitions, eq(tourDefinitions.id, bookings.tourId)).where(eq(bookings.tenantId, tenantId)).orderBy(sql`${bookings.createdAt} desc`).limit(8),
  ]);
  return { bookingTotals: bookingTotals[0], departureTotals: departureTotals[0], travelerTotals: travelerTotals[0], statuses, upcoming, trend, recentBookings };
}
