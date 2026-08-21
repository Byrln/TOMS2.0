import { randomUUID } from "node:crypto";
import { BookingConflictError, calculateQuote, createHold as createDomainHold, projectTravelerItinerary, type StaffRole } from "@toms/domain";
import type { BookingHoldRequest, CheckoutRequest, ItineraryUpdate } from "@toms/contracts";
import type { BookingView, DashboardView, DepartureView, HoldView, ItineraryEventView, TenantView, TourView } from "./types";

export interface CreateTourInput {
  name: string;
  slug: string;
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  basePriceMinor: number;
  currency: string;
  destinations: string[];
}

export interface CreateDepartureInput {
  tourId: string;
  code: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  priceMinor: number;
  currency: string;
}

export interface TomsRepository {
  tenant(): TenantView;
  dashboard(): DashboardView;
  listTours(options?: { includeDrafts?: boolean }): TourView[];
  getTourBySlug(slug: string, options?: { includeDrafts?: boolean }): TourView | undefined;
  createTour(input: CreateTourInput): TourView;
  createDeparture(input: CreateDepartureInput): DepartureView;
  publishTour(id: string): TourView;
  createHold(input: BookingHoldRequest, now: Date): HoldView;
  checkout(input: CheckoutRequest, now: Date): BookingView;
  listTrips(email: string): BookingView[];
  getTrip(id: string, email: string): { booking: BookingView; tour: TourView; departure: DepartureView; itinerary: ReturnType<typeof projectTravelerItinerary> } | undefined;
  updateItinerary(departureId: string, eventId: string, update: ItineraryUpdate): ItineraryEventView;
  storefront(): { name: string; template: string; theme: Record<string, string>; promotions: Array<{ id: string; name: string; code: string; benefit: string }> };
  resources(resource: string): unknown[];
}

const ids = {
  tenant: "11111111-1111-4111-8111-111111111111",
  classicEurope: "21111111-1111-4111-8111-111111111111",
  seoul: "21111111-1111-4111-8111-111111111112",
  gobi: "21111111-1111-4111-8111-111111111113",
  altai: "21111111-1111-4111-8111-111111111114",
  japan: "21111111-1111-4111-8111-111111111115",
  kyrgyz: "21111111-1111-4111-8111-111111111116",
  lake: "21111111-1111-4111-8111-111111111117",
  silk: "21111111-1111-4111-8111-111111111118",
  depEurope: "31111111-1111-4111-8111-111111111111",
  depSeoul: "31111111-1111-4111-8111-111111111112",
  depGobi: "31111111-1111-4111-8111-111111111113"
} as const;

function tour(input: Partial<TourView> & Pick<TourView, "id" | "slug" | "name" | "summary" | "heroImageUrl" | "destinations">): TourView {
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    summary: input.summary,
    description: input.description ?? `${input.summary} Carefully coordinated by local travel specialists.`,
    durationDays: input.durationDays ?? 7,
    durationNights: input.durationNights ?? 6,
    basePriceMinor: input.basePriceMinor ?? 3_450_000,
    currency: input.currency ?? "MNT",
    status: input.status ?? "PUBLISHED",
    destinations: input.destinations,
    heroImageUrl: input.heroImageUrl,
    highlights: input.highlights ?? ["Expert-led itinerary", "Small group departure", "24/7 journey support"],
    inclusions: input.inclusions ?? ["Accommodation", "Breakfast", "Airport transfers", "Local guide"],
    departures: input.departures ?? []
  };
}

export function createDemoRepository(): TomsRepository {
  const tenant: TenantView = { id: ids.tenant, slug: "toms-demo", name: "TOMS Demo Travel", defaultCurrency: "MNT", locale: "mn-MN" };
  const departures: DepartureView[] = [
    { id: ids.depEurope, tourId: ids.classicEurope, code: "EUR-2026-10-03", startsOn: "2026-10-03", endsOn: "2026-10-09", capacity: 32, confirmedCount: 24, priceMinor: 3_450_000, currency: "MNT", status: "GUARANTEED" },
    { id: ids.depSeoul, tourId: ids.seoul, code: "SEL-2026-09-15", startsOn: "2026-09-15", endsOn: "2026-09-20", capacity: 24, confirmedCount: 18, priceMinor: 3_030_000, currency: "MNT", status: "GUARANTEED" },
    { id: ids.depGobi, tourId: ids.gobi, code: "GOB-2026-10-17", startsOn: "2026-10-17", endsOn: "2026-10-25", capacity: 18, confirmedCount: 9, priceMinor: 2_850_000, currency: "MNT", status: "OPEN" }
  ];
  const tours: TourView[] = [
    tour({ id: ids.classicEurope, slug: "classic-europe", name: "Классик Европ", summary: "Парис, Люксембург, Италиар дамжих сонгодог аялал", heroImageUrl: "/images/classic-europe.png", destinations: ["France", "Luxembourg", "Italy"], departures: departures.filter((d) => d.tourId === ids.classicEurope) }),
    tour({ id: ids.seoul, slug: "seoul-city-experience", name: "Сөүл хотын аялал", summary: "Орчин үе ба уламжлалыг нэг аяллаар мэдэр", heroImageUrl: "/images/seoul.png", destinations: ["Seoul", "DMZ"], basePriceMinor: 3_030_000, durationDays: 6, durationNights: 5, departures: departures.filter((d) => d.tourId === ids.seoul) }),
    tour({ id: ids.gobi, slug: "gobi-discovery", name: "Говийн гайхамшиг", summary: "Хонгорын элс, Баянзаг, нүүдэлчдийн амьдрал", heroImageUrl: "/images/gobi.png", destinations: ["Gobi", "Bayanzag"], basePriceMinor: 2_850_000, durationDays: 9, durationNights: 8, departures: departures.filter((d) => d.tourId === ids.gobi) }),
    tour({ id: ids.altai, slug: "altai-adventure", name: "Алтайн адал явдал", summary: "Монгол Алтайн уулс ба бүргэдчдийн нутаг", heroImageUrl: "/images/altai.png", destinations: ["Bayan-Ulgii", "Altai"], basePriceMinor: 4_150_000 }),
    tour({ id: ids.japan, slug: "japan-autumn", name: "Японы намрын өнгө", summary: "Токио, Киото, Нарагийн намрын аялал", heroImageUrl: "/images/seoul.png", destinations: ["Tokyo", "Kyoto", "Nara"], basePriceMinor: 4_650_000 }),
    tour({ id: ids.kyrgyz, slug: "kyrgyz-highlands", name: "Тэнгэр уулсын жим", summary: "Кыргызын нуур, уул, нүүдэлчдийн соёл", heroImageUrl: "/images/altai.png", destinations: ["Bishkek", "Issyk-Kul"] }),
    tour({ id: ids.lake, slug: "khuvsgul-retreat", name: "Хөвсгөлийн цэнхэр сувд", summary: "Тайга, цаатан соёл, нуурын амгалан", heroImageUrl: "/images/altai.png", destinations: ["Khuvsgul"] }),
    tour({ id: ids.silk, slug: "silk-road", name: "Торгоны зам", summary: "Самарканд, Бухара, Ташкентын өв", heroImageUrl: "/images/gobi.png", destinations: ["Uzbekistan"] })
  ];

  const itinerary: ItineraryEventView[] = [
    { id: "41111111-1111-4111-8111-111111111111", departureId: ids.depSeoul, dayNumber: 1, startsAt: "2026-09-15T00:30:00Z", title: "Chinggis Khaan Airport meeting", location: "Terminal 2, information desk B", details: "Meet the TOMS representative 90 minutes before check-in.", visibility: "TRAVELER", internalNote: "Supplier transfer ref SEL-TR-104" },
    { id: "41111111-1111-4111-8111-111111111112", departureId: ids.depSeoul, dayNumber: 1, startsAt: "2026-09-15T03:40:00Z", title: "MIAT OM301 UBN → ICN", location: "Chinggis Khaan International Airport", details: "Flight time 3h 10m.", visibility: "TRAVELER", internalNote: "Group seat block 18A-24F" },
    { id: "41111111-1111-4111-8111-111111111113", departureId: ids.depSeoul, dayNumber: 1, startsAt: "2026-09-15T09:10:00Z", title: "Airport pickup", location: "Incheon Terminal 1", details: "Toyota Hiace, driver Minsoo Kim.", visibility: "TRAVELER", internalNote: "Supplier cost 140000 KRW" },
    { id: "41111111-1111-4111-8111-111111111114", departureId: ids.depSeoul, dayNumber: 1, startsAt: "2026-09-15T11:00:00Z", title: "Hotel check-in", location: "Myeongdong, Seoul", details: "L7 Myeongdong by LOTTE, twin room.", visibility: "TRAVELER", internalNote: "Hotel confirmation SEL-L7-398" },
    { id: "41111111-1111-4111-8111-111111111115", departureId: ids.depSeoul, dayNumber: 1, startsAt: "2026-09-15T12:00:00Z", title: "Guide operations briefing", location: "Hotel lobby", details: "Internal coordination.", visibility: "STAFF", internalNote: "Do not expose supplier margin" }
  ];
  const holds: HoldView[] = [];
  const bookings: BookingView[] = [{
    id: "51111111-1111-4111-8111-111111111111",
    bookingNumber: "TOMS-2026-0001234",
    departureId: ids.depSeoul,
    tourId: ids.seoul,
    organizerEmail: "bat@example.com",
    payerName: "Bat-Orgil Munkhbat",
    travelers: [{ id: "61111111-1111-4111-8111-111111111111", fullName: "Bat-Orgil Munkhbat", nationality: "MN" }, { id: "61111111-1111-4111-8111-111111111112", fullName: "Enkhjin Munkhbat", nationality: "MN" }],
    partySize: 2,
    status: "CONFIRMED",
    paymentStatus: "SUCCEEDED",
    currency: "MNT",
    totalMinor: 3_030_000,
    invoiceNumber: "INV-2026-0001234",
    createdAt: "2026-08-01T09:00:00Z"
  }];

  function findDeparture(id: string): DepartureView {
    const departure = departures.find((item) => item.id === id);
    if (!departure) throw new BookingConflictError("Departure not found");
    return departure;
  }

  const repository: TomsRepository = {
    tenant: () => tenant,
    dashboard: () => ({
      metrics: { grossBookingValueMinor: 1_286_650_000, confirmedBookings: 1248, upcomingDepartures: 24, travelers: 2853, storefrontConversion: 3.62 },
      revenueTrend: [410, 520, 490, 680, 615, 820, 760, 940, 890, 1120, 1010, 1286],
      bookingsByStatus: [{ status: "Confirmed", count: 824 }, { status: "Pending", count: 198 }, { status: "Held", count: 126 }, { status: "Cancelled", count: 68 }],
      upcomingDepartures: departures.map((departure) => ({ id: departure.id, tourName: tours.find((item) => item.id === departure.tourId)?.name ?? "Tour", startsOn: departure.startsOn, confirmedCount: departure.confirmedCount, capacity: departure.capacity, status: departure.status }))
    }),
    listTours: (options) => tours.filter((item) => options?.includeDrafts === true || item.status === "PUBLISHED"),
    getTourBySlug: (slug, options) => tours.find((item) => item.slug === slug && (options?.includeDrafts === true || item.status === "PUBLISHED")),
    createTour: (input) => {
      const created = tour({ ...input, id: randomUUID(), status: "DRAFT", heroImageUrl: "/images/altai.png", highlights: ["New departure"], inclusions: [], departures: [] });
      tours.push(created);
      return created;
    },
    createDeparture: (input) => {
      const parent = tours.find((item) => item.id === input.tourId);
      if (!parent) throw new BookingConflictError("Tour not found");
      const created: DepartureView = { id: randomUUID(), ...input, confirmedCount: 0, status: "DRAFT" };
      departures.push(created);
      parent.departures.push(created);
      return created;
    },
    publishTour: (id) => {
      const selected = tours.find((item) => item.id === id);
      if (!selected) throw new BookingConflictError("Tour not found");
      selected.status = "PUBLISHED";
      selected.departures.forEach((departure) => { if (departure.status === "DRAFT") departure.status = "OPEN"; });
      return selected;
    },
    createHold: (input, now) => {
      const existing = holds.find((hold) => hold.idempotencyKey === input.idempotencyKey);
      if (existing) return existing;
      const departure = findDeparture(input.departureId);
      const activeHeld = holds.filter((hold) => hold.departureId === input.departureId && hold.status === "ACTIVE" && new Date(hold.expiresAt) > now).reduce((sum, hold) => sum + hold.partySize, 0);
      const created = createDomainHold({ departureId: input.departureId, capacity: departure.capacity, confirmed: departure.confirmedCount, activeHeld, requested: input.partySize, now });
      const view: HoldView = { id: created.id, departureId: created.departureId, partySize: created.partySize, status: created.status, expiresAt: created.expiresAt.toISOString(), idempotencyKey: input.idempotencyKey };
      holds.push(view);
      return view;
    },
    checkout: (input, now) => {
      const existing = bookings.find((booking) => booking.bookingNumber.endsWith(input.idempotencyKey.slice(-6)) && booking.organizerEmail === input.payer.email);
      if (existing) return existing;
      const hold = holds.find((item) => item.id === input.holdId);
      if (!hold || hold.status !== "ACTIVE" || new Date(hold.expiresAt) <= now) throw new BookingConflictError("Inventory hold expired");
      if (hold.partySize !== input.travelers.length) throw new BookingConflictError("Traveler count does not match inventory hold");
      const departure = findDeparture(hold.departureId);
      const selectedTour = tours.find((item) => item.id === departure.tourId);
      if (!selectedTour) throw new BookingConflictError("Tour not found");
      const quote = calculateQuote({ currency: departure.currency === "MNT" ? "MNT" : "USD", unitPriceMinor: departure.priceMinor, travelers: hold.partySize, addOns: [] });
      const id = randomUUID();
      const suffix = input.idempotencyKey.slice(-6).toUpperCase();
      const booking: BookingView = {
        id,
        bookingNumber: `TOMS-2026-${suffix}`,
        departureId: departure.id,
        tourId: selectedTour.id,
        organizerEmail: input.payer.email,
        payerName: input.payer.fullName,
        travelers: input.travelers.map((traveler) => ({ id: randomUUID(), fullName: traveler.fullName, nationality: traveler.nationality })),
        partySize: input.travelers.length,
        status: "CONFIRMED",
        paymentStatus: "SUCCEEDED",
        currency: departure.currency,
        totalMinor: quote.totalMinor,
        invoiceNumber: `INV-2026-${suffix}`,
        createdAt: now.toISOString()
      };
      hold.status = "CONSUMED";
      departure.confirmedCount += hold.partySize;
      bookings.push(booking);
      return booking;
    },
    listTrips: (email) => bookings.filter((booking) => booking.organizerEmail.toLowerCase() === email.toLowerCase()),
    getTrip: (id, email) => {
      const booking = bookings.find((item) => item.id === id && item.organizerEmail.toLowerCase() === email.toLowerCase());
      if (!booking) return undefined;
      const selectedTour = tours.find((item) => item.id === booking.tourId);
      const departure = departures.find((item) => item.id === booking.departureId);
      if (!selectedTour || !departure) return undefined;
      return { booking, tour: selectedTour, departure, itinerary: projectTravelerItinerary(itinerary.filter((event) => event.departureId === departure.id)) };
    },
    updateItinerary: (departureId, eventId, update) => {
      const event = itinerary.find((item) => item.id === eventId && item.departureId === departureId);
      if (!event) throw new BookingConflictError("Itinerary event not found");
      event.title = update.title;
      event.startsAt = update.startsAt;
      event.location = update.location ?? "";
      event.details = update.details ?? "";
      event.visibility = update.visibility;
      return event;
    },
    storefront: () => ({
      name: "Munkh Discovery",
      template: "himalaya",
      theme: { primary: "#071f3d", accent: "#d6a541", background: "#fbfaf7", radius: "10px" },
      promotions: [{ id: "71111111-1111-4111-8111-111111111111", name: "Эрт захиалгын хөнгөлөлт", code: "EARLY10", benefit: "10% хүртэл" }, { id: "71111111-1111-4111-8111-111111111112", name: "Гэр бүлийн урамшуулал", code: "FAMILY5", benefit: "5% нэмэлт" }]
    }),
    resources: (resource) => {
      const maps: Record<string, unknown[]> = {
        tours,
        departures,
        bookings,
        travelers: bookings.flatMap((booking) => booking.travelers),
        customers: bookings.map((booking) => ({ id: booking.id, name: booking.payerName, email: booking.organizerEmail, lifetimeValueMinor: booking.totalMinor })),
        payments: bookings.map((booking) => ({ id: booking.id, bookingNumber: booking.bookingNumber, amountMinor: booking.totalMinor, status: booking.paymentStatus, provider: "DemoPay" })),
        invoices: bookings.map((booking) => ({ id: booking.id, invoiceNumber: booking.invoiceNumber, amountMinor: booking.totalMinor, status: "PAID" })),
        documents: [{ id: "81111111-1111-4111-8111-111111111111", type: "E-voucher", bookingNumber: bookings[0]?.bookingNumber, status: "READY" }],
        promotions: repository.storefront().promotions,
        operations: departures,
        conversations: [{ id: "91111111-1111-4111-8111-111111111111", customer: "Bat-Orgil Munkhbat", subject: "Trip change request", status: "OPEN", updatedAt: "2026-08-21T08:30:00Z" }],
        suppliers: [{ id: "a1111111-1111-4111-8111-111111111111", name: "Seoul Transport Co.", type: "TRANSPORT", status: "ACTIVE" }]
      };
      return maps[resource] ?? [];
    }
  };
  return repository;
}

export function assertDemoRole(value: string | undefined): StaffRole {
  const roles: StaffRole[] = ["OWNER", "ADMIN", "SALES", "OPERATIONS", "FINANCE", "CONTENT", "GUIDE", "VIEWER"];
  if (!value || !roles.includes(value as StaffRole)) throw new Error("UNAUTHORIZED");
  return value as StaffRole;
}
