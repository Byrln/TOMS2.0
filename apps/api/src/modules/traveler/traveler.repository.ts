import { and, asc, eq } from "drizzle-orm";
import {
  bookingParties,
  bookings,
  departures,
  invoices,
  itineraryEvents,
  people,
  tourDefinitions,
  travelerProfiles,
  type TomsTransaction,
} from "@toms/db";

export async function listTravelerBookings(tx: TomsTransaction, userId: string) {
  return tx.select({
    id: bookings.id,
    bookingNumber: bookings.bookingNumber,
    departureId: bookings.departureId,
    tourId: bookings.tourId,
    organizerEmail: bookings.organizerEmail,
    partySize: bookings.partySize,
    status: bookings.status,
    paymentStatus: bookings.paymentStatus,
    currency: bookings.currency,
    totalMinor: bookings.totalMinor,
    createdAt: bookings.createdAt,
  }).from(bookings)
    .innerJoin(bookingParties, and(eq(bookingParties.bookingId, bookings.id), eq(bookingParties.authUserId, userId)))
    .orderBy(asc(bookings.createdAt));
}

export async function readTravelerTrip(tx: TomsTransaction, userId: string, bookingId: string, locale: "mn" | "en") {
  const baseRows = await tx.select({ booking: bookings, tour: tourDefinitions, departure: departures })
    .from(bookings)
    .innerJoin(bookingParties, and(eq(bookingParties.bookingId, bookings.id), eq(bookingParties.authUserId, userId)))
    .innerJoin(tourDefinitions, eq(tourDefinitions.id, bookings.tourId))
    .innerJoin(departures, eq(departures.id, bookings.departureId))
    .where(eq(bookings.id, bookingId)).limit(1);
  const base = baseRows[0];
  if (!base) return null;

  const [partyRows, eventRows, invoiceRows] = await Promise.all([
    tx.select({ party: bookingParties, profile: travelerProfiles, person: people })
      .from(bookingParties)
      .innerJoin(travelerProfiles, eq(travelerProfiles.id, bookingParties.travelerProfileId))
      .innerJoin(people, eq(people.id, travelerProfiles.personId))
      .where(eq(bookingParties.bookingId, bookingId)),
    tx.select().from(itineraryEvents).where(eq(itineraryEvents.departureId, base.departure.id))
      .orderBy(asc(itineraryEvents.dayNumber), asc(itineraryEvents.sortOrder)),
    tx.select().from(invoices).where(eq(invoices.bookingId, bookingId)).limit(1),
  ]);
  const invoice = invoiceRows[0];

  return {
    id: base.booking.id,
    bookingNumber: base.booking.bookingNumber,
    departureId: base.booking.departureId,
    tourId: base.booking.tourId,
    organizerEmail: base.booking.organizerEmail,
    payerName: partyRows.find((item) => item.party.isOrganizer)?.person.firstName ?? "",
    partySize: base.booking.partySize,
    status: base.booking.status,
    paymentStatus: base.booking.paymentStatus,
    currency: base.booking.currency,
    totalMinor: Number(base.booking.totalMinor),
    invoiceNumber: invoice?.invoiceNumber ?? "",
    createdAt: base.booking.createdAt.toISOString(),
    travelers: partyRows.map(({ party, person }) => ({ id: party.id, fullName: `${person.firstName} ${person.lastName}`.trim(), nationality: person.nationality ?? "" })),
    tour: {
      id: base.tour.id,
      slug: base.tour.slug,
      name: base.tour.nameI18n[locale],
      summary: base.tour.summaryI18n[locale],
      description: base.tour.descriptionI18n[locale],
      durationDays: base.tour.durationDays,
      durationNights: base.tour.durationNights,
      basePriceMinor: Number(base.booking.totalMinor) / base.booking.partySize,
      currency: base.booking.currency,
      status: base.tour.status,
      destinations: base.tour.destinations,
      heroImageUrl: base.tour.heroImagePath ?? "/images/altai.png",
      highlights: base.tour.highlightsI18n.map((item) => item[locale]),
      inclusions: base.tour.inclusionsI18n.map((item) => item[locale]),
      departures: [{ ...base.departure, priceMinor: Number(base.booking.totalMinor) / base.booking.partySize, currency: base.booking.currency }],
    },
    departure: { ...base.departure, priceMinor: Number(base.booking.totalMinor) / base.booking.partySize, currency: base.booking.currency },
    itinerary: eventRows.map((event) => ({
      id: event.id,
      title: event.titleI18n[locale],
      startsAt: event.startsAt.toISOString(),
      location: event.locationI18n[locale],
      details: event.detailsI18n[locale],
    })),
  };
}
