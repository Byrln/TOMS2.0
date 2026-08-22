import { randomUUID } from "node:crypto";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import {
  auditLogs,
  bookingParties,
  bookings,
  customerAccounts,
  departures,
  idempotencyKeys,
  inventoryHolds,
  invoices,
  outboxEvents,
  people,
  tourDefinitions,
  tourPrices,
  travelerProfiles,
  type TomsTransaction,
} from "@toms/db";

export async function reserveInventory(
  tx: TomsTransaction,
  tenantId: string,
  departureId: string,
  quantity: number,
  expiresAt: Date,
  idempotencyKey: string,
) {
  const result = await tx.execute<{ holdId: string }>(sql`
    select public.reserve_inventory(
      ${tenantId}::uuid,
      ${departureId}::uuid,
      ${quantity}::integer,
      ${expiresAt}::timestamptz,
      ${idempotencyKey}::text
    ) as "holdId"
  `);
  const holdId = result[0]?.holdId;
  if (!holdId) throw new Error("Inventory hold function returned no identifier");
  return holdId;
}

export async function readCheckoutIdempotency(tx: TomsTransaction, tenantId: string, key: string) {
  const rows = await tx.select().from(idempotencyKeys).where(and(
    eq(idempotencyKeys.tenantId, tenantId),
    eq(idempotencyKeys.operation, "checkout.create"),
    eq(idempotencyKeys.idempotencyKey, key),
  )).limit(1);
  return rows[0] ?? null;
}

export async function readActiveHoldContext(tx: TomsTransaction, tenantId: string, holdId: string, now: Date) {
  const holds = await tx.select().from(inventoryHolds).where(and(
    eq(inventoryHolds.id, holdId),
    eq(inventoryHolds.tenantId, tenantId),
    eq(inventoryHolds.status, "ACTIVE"),
    gt(inventoryHolds.expiresAt, now),
  )).limit(1);
  const hold = holds[0];
  if (!hold) return null;
  const departureRows = await tx.select().from(departures).where(and(
    eq(departures.id, hold.departureId),
    eq(departures.tenantId, tenantId),
  )).limit(1);
  const departure = departureRows[0];
  if (!departure) return null;
  const tourRows = await tx.select().from(tourDefinitions).where(and(
    eq(tourDefinitions.id, departure.tourId),
    eq(tourDefinitions.tenantId, tenantId),
    eq(tourDefinitions.status, "PUBLISHED"),
  )).limit(1);
  const tour = tourRows[0];
  if (!tour) return null;
  const prices = await tx.select().from(tourPrices).where(and(
    eq(tourPrices.tenantId, tenantId),
    eq(tourPrices.tourId, tour.id),
    or(eq(tourPrices.departureId, departure.id), isNull(tourPrices.departureId)),
  ));
  const price = prices.find((item) => item.departureId === departure.id) ?? prices[0];
  return price ? { hold, departure, tour, price } : null;
}

export interface CheckoutWrite {
  tenantId: string;
  requestHash: string;
  idempotencyKey: string;
  holdId: string;
  payer: { fullName: string; email: string };
  travelers: Array<{ fullName: string; nationality: string }>;
  now: Date;
}

function splitName(fullName: string) {
  const [firstName = fullName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") || "—" };
}

export async function writeCheckout(tx: TomsTransaction, input: CheckoutWrite) {
  const context = await readActiveHoldContext(tx, input.tenantId, input.holdId, input.now);
  if (!context || context.hold.quantity !== input.travelers.length) return null;
  const totalMinor = context.price.amountMinor * BigInt(input.travelers.length);
  const payerName = splitName(input.payer.fullName);
  const payerRows = await tx.insert(people).values({
    tenantId: input.tenantId,
    ...payerName,
    email: input.payer.email,
  }).returning();
  const payer = payerRows[0]!;
  const customerRows = await tx.insert(customerAccounts).values({
    tenantId: input.tenantId,
    personId: payer.id,
    source: "STOREFRONT",
  }).returning();
  const customer = customerRows[0]!;

  const travelerRecords: Array<{ personId: string; profileId: string; snapshot: Record<string, unknown> }> = [];
  for (const traveler of input.travelers) {
    const personRows = await tx.insert(people).values({
      tenantId: input.tenantId,
      ...splitName(traveler.fullName),
      nationality: traveler.nationality,
      ...(traveler.fullName === input.payer.fullName ? { email: input.payer.email } : {}),
    }).returning();
    const person = personRows[0]!;
    const profileRows = await tx.insert(travelerProfiles).values({
      tenantId: input.tenantId,
      personId: person.id,
      passportCountry: traveler.nationality,
    }).returning();
    travelerRecords.push({ personId: person.id, profileId: profileRows[0]!.id, snapshot: traveler });
  }

  const bookingNumber = `TOMS-${input.now.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const bookingRows = await tx.insert(bookings).values({
    tenantId: input.tenantId,
    bookingNumber,
    tourId: context.tour.id,
    departureId: context.departure.id,
    holdId: context.hold.id,
    customerAccountId: customer.id,
    organizerPersonId: travelerRecords[0]!.personId,
    payerPersonId: payer.id,
    organizerEmail: input.payer.email,
    partySize: input.travelers.length,
    status: "ON_HOLD",
    paymentStatus: "UNPAID",
    totalMinor,
    currency: context.price.currency,
    source: "STOREFRONT",
    tourSnapshot: { id: context.tour.id, slug: context.tour.slug, name: context.tour.nameI18n },
    priceSnapshot: { unitPriceMinor: context.price.amountMinor.toString(), partySize: input.travelers.length, currency: context.price.currency },
  }).returning();
  const booking = bookingRows[0]!;

  await tx.insert(bookingParties).values(travelerRecords.map((traveler, index) => ({
    tenantId: input.tenantId,
    bookingId: booking.id,
    travelerProfileId: traveler.profileId,
    travelerSnapshot: traveler.snapshot,
    isOrganizer: index === 0,
  })));
  const invoiceNumber = bookingNumber.replace("TOMS-", "INV-");
  await tx.insert(invoices).values({
    tenantId: input.tenantId,
    bookingId: booking.id,
    invoiceNumber,
    status: "ISSUED",
    totalMinor,
    currency: context.price.currency,
    issuedAt: input.now,
    dueAt: context.hold.expiresAt,
  });
  const result = { id: booking.id, bookingNumber, organizerEmail: booking.organizerEmail, invoiceNumber, status: booking.status, paymentStatus: booking.paymentStatus };
  await tx.insert(auditLogs).values({ tenantId: input.tenantId, action: "booking.created", entityType: "booking", entityId: booking.id, after: result });
  await tx.insert(outboxEvents).values({ tenantId: input.tenantId, eventType: "booking.created", aggregateType: "booking", aggregateId: booking.id, deduplicationKey: `booking.created:${booking.id}`, payload: result });
  await tx.insert(idempotencyKeys).values({
    tenantId: input.tenantId,
    operation: "checkout.create",
    idempotencyKey: input.idempotencyKey,
    requestHash: input.requestHash,
    result,
    resourceType: "booking",
    resourceId: booking.id,
    expiresAt: new Date(input.now.getTime() + 24 * 60 * 60 * 1000),
  });
  return result;
}
