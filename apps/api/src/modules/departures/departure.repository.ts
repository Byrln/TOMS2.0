import { and, asc, eq } from "drizzle-orm";
import { departures, tourDefinitions, tourPrices, type TomsTransaction } from "@toms/db";

export async function listDepartures(tx: TomsTransaction, tenantId: string) {
  return tx.select({ departure: departures, tourName: tourDefinitions.nameI18n, tourSlug: tourDefinitions.slug })
    .from(departures)
    .innerJoin(tourDefinitions, eq(tourDefinitions.id, departures.tourId))
    .where(eq(departures.tenantId, tenantId))
    .orderBy(asc(departures.startsOn));
}

export interface CreateDepartureRecord {
  tenantId: string;
  tourId: string;
  code: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  priceMinor: number;
  currency: string;
}

export async function insertDeparture(tx: TomsTransaction, input: CreateDepartureRecord) {
  const tours = await tx.select({ id: tourDefinitions.id }).from(tourDefinitions).where(and(eq(tourDefinitions.id, input.tourId), eq(tourDefinitions.tenantId, input.tenantId))).limit(1);
  if (!tours[0]) return null;
  const rows = await tx.insert(departures).values({ tenantId: input.tenantId, tourId: input.tourId, code: input.code, startsOn: input.startsOn, endsOn: input.endsOn, capacity: input.capacity, status: "OPEN" }).returning();
  const created = rows[0]!;
  await tx.insert(tourPrices).values({ tenantId: input.tenantId, tourId: input.tourId, departureId: created.id, priceType: "ADULT", amountMinor: BigInt(input.priceMinor), currency: input.currency });
  return created;
}
