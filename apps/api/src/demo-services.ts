import type { ApiServices, PageQuery } from "./services";
import type { VerifiedAccessToken } from "./plugins/auth.plugin";

const tenantId = "11111111-1111-4111-8111-111111111111";
const now = "2026-08-22T08:00:00+08:00";
const imagePaths = ["/images/seoul.png", "/images/classic-europe.png", "/images/gobi.png", "/images/altai.png"];

const id = (group: number, index: number) => `${String(group).padStart(8, "0")}-0000-4000-8000-${String(index).padStart(12, "0")}`;
const localize = (locale: "mn" | "en", mn: string, en: string) => locale === "mn" ? mn : en;
const money = (amountMinor: number, currency = "MNT") => ({ amountMinor, currency });
const page = (total: number, query?: PageQuery) => {
  const pageSize = query?.pageSize ?? 25;
  const currentPage = query?.page ?? 1;
  return { page: currentPage, pageSize, total, pageCount: Math.ceil(total / pageSize) };
};
const paginate = <T>(items: T[], query?: PageQuery) => {
  const start = ((query?.page ?? 1) - 1) * (query?.pageSize ?? 25);
  return items.slice(start, start + (query?.pageSize ?? 25));
};

export const demoAccessToken: VerifiedAccessToken = {
  userId: "81111111-1111-4111-8111-111111111111",
  token: "toms-demo-access-token",
  claims: { sub: "81111111-1111-4111-8111-111111111111", email: "bat@example.com", iss: "toms-demo" },
};

const tourSeed = [
  ["seoul-city-experience", "Сөүл хотын аялал", "Seoul City Experience", "Хотын соёл", "City & culture", 5, 4, 2_890_000, "Seoul", "CULTURE"],
  ["classic-europe", "Сонгодог Европ", "Classic Europe", "Европын сонгодог хотууд", "Europe's timeless capitals", 12, 11, 8_950_000, "Europe", "CULTURE"],
  ["gobi-discovery", "Говийн нээлт", "Gobi Discovery", "Говийн одод, элсэн манхан", "Dunes, stars and desert camps", 7, 6, 4_250_000, "Gobi", "NATURE"],
  ["altai-adventure", "Алтайн адал явдал", "Altai Adventure", "Бүргэдчид ба өндөр уулс", "Eagle hunters and high mountains", 8, 7, 4_850_000, "Altai", "ADVENTURE"],
  ["khuvsgul-blue-pearl", "Хөвсгөлийн цэнхэр сувд", "Khuvsgul Blue Pearl", "Тайгын нуурын тайван аялал", "A restorative journey to the taiga lake", 6, 5, 3_750_000, "Khuvsgul", "NATURE"],
  ["tokyo-design-food", "Токиогийн дизайн ба амт", "Tokyo Design & Food", "Дизайн, зах, орчин үеийн Япон", "Design, markets and modern Japan", 6, 5, 5_450_000, "Tokyo", "CULINARY"],
  ["silk-road-samarkand", "Самаркандын торгоны зам", "Silk Road Samarkand", "Торгоны замын архитектур", "Architecture along the Silk Road", 9, 8, 6_250_000, "Samarkand", "CULTURE"],
  ["bali-family-retreat", "Балигийн гэр бүлийн амралт", "Bali Family Retreat", "Гэр бүлд зориулсан арлын амралт", "An island retreat designed for families", 8, 7, 7_150_000, "Bali", "FAMILY"],
] as const;

function tours(locale: "mn" | "en") {
  return tourSeed.map((seed, index) => ({
    id: id(2, index + 1),
    slug: seed[0],
    name: locale === "mn" ? seed[1] : seed[2],
    summary: locale === "mn" ? seed[3] : seed[4],
    description: localize(locale, `${seed[1]} нь орон нутгийн эксперт, жижиг бүлэг, нягт нямбай хөтөлбөрийг нэгтгэнэ.`, `${seed[2]} combines local expertise, intimate groups and a carefully paced itinerary.`),
    category: seed[9], durationDays: seed[5], durationNights: seed[6], difficulty: index % 3 === 0 ? "MODERATE" : "EASY",
    destinations: [seed[8]], languages: ["mn", "en"], heroImageUrl: imagePaths[index % imagePaths.length]!, heroImagePath: imagePaths[index % imagePaths.length]!,
    basePriceMinor: seed[7], currency: "MNT", status: index === 6 ? "DRAFT" : index === 7 ? "ARCHIVED" : "PUBLISHED",
    highlights: localize(locale, ["Орон нутгийн эксперт хөтөч", "Жижиг бүлэг", "Онцгой туршлага"].join("|"), ["Expert local host", "Small group", "Signature experiences"].join("|")).split("|"),
    inclusions: localize(locale, ["Байр", "Өглөөний цай", "Хөтөч ба шилжүүлэг"].join("|"), ["Accommodation", "Daily breakfast", "Host and transfers"].join("|")).split("|"),
    exclusions: localize(locale, ["Олон улсын нислэг", "Хувийн зардал"].join("|"), ["International flights", "Personal expenses"].join("|")).split("|"),
    createdAt: `2026-0${(index % 7) + 1}-12T09:00:00+08:00`, nextDeparture: `2026-${String(9 + Math.floor(index / 4)).padStart(2, "0")}-${String(5 + index).padStart(2, "0")}`,
  }));
}

function departures(locale: "mn" | "en") {
  const allTours = tours(locale);
  return Array.from({ length: 16 }, (_, index) => {
    const tour = allTours[index % allTours.length]!;
    const month = 9 + Math.floor(index / 6);
    const day = 4 + (index * 3) % 22;
    const capacity = [12, 16, 18, 20][index % 4]!;
    const confirmedCount = [4, 9, 13, 16, 6, 11][index % 6]!;
    const status = ["OPEN", "GUARANTEED", "SOLD_OUT", "OPEN", "CANCELLED", "GUARANTEED"][index % 6]!;
    return {
      id: id(3, index + 1), tourId: tour.id, tourName: tour.name, tourNameI18n: { mn: tourSeed[index % 8]![1], en: tourSeed[index % 8]![2] },
      code: `${tour.slug.slice(0, 3).toUpperCase()}-26-${String(index + 1).padStart(2, "0")}`,
      startsOn: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      endsOn: `2026-${String(month).padStart(2, "0")}-${String(Math.min(day + tour.durationDays - 1, 28)).padStart(2, "0")}`,
      capacity, confirmedCount: Math.min(confirmedCount, capacity), heldCount: index % 3, status,
      tripStatus: index % 5 === 0 ? "AT_RISK" : "UPCOMING", priceMinor: tour.basePriceMinor + (index % 2) * 250_000, currency: "MNT",
      bookingDeadline: `2026-${String(month).padStart(2, "0")}-${String(Math.max(1, day - 7)).padStart(2, "0")}`,
      readinessPercent: [92, 78, 64, 88, 45][index % 5]!, documentReadinessPercent: [96, 70, 58, 90][index % 4]!, riskCount: [0, 2, 4, 1, 6][index % 5]!,
    };
  });
}

function bookings(locale: "mn" | "en") {
  const allDepartures = departures(locale);
  return Array.from({ length: 48 }, (_, index) => {
    const departure = allDepartures[index % allDepartures.length]!;
    const partySize = index % 3 === 0 ? 3 : 2;
    const totalMinor = departure.priceMinor * partySize;
    return {
      id: id(5, index + 1), bookingNumber: `TOMS-26-${String(index + 101).padStart(4, "0")}`,
      departureId: departure.id, departureCode: departure.code, tourId: departure.tourId, tourName: departure.tourName,
      customerName: localize(locale, `Зорчигч ${index + 1}`, `Traveler ${index + 1}`), organizerEmail: `traveler${index + 1}@example.com`,
      partySize, status: ["CONFIRMED", "HELD", "PENDING", "CANCELLED"][index % 4]!,
      paymentStatus: ["PAID", "PARTIALLY_PAID", "UNPAID", "FAILED"][index % 4]!, source: ["STOREFRONT", "AGENT", "PHONE"][index % 3]!,
      currency: "MNT", totalMinor, paidMinor: index % 4 === 0 ? totalMinor : index % 4 === 1 ? Math.round(totalMinor / 2) : 0,
      createdAt: `2026-08-${String((index % 21) + 1).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:00:00+08:00`,
    };
  });
}

function travelers(locale: "mn" | "en") {
  const allBookings = bookings(locale);
  return Array.from({ length: 96 }, (_, index) => {
    const booking = allBookings[Math.floor(index / 2)]!;
    return {
      id: id(8, index + 1), bookingId: booking.id, bookingNumber: booking.bookingNumber, departureCode: booking.departureCode, tourName: booking.tourName,
      firstName: localize(locale, `Нэр${index + 1}`, `Name${index + 1}`), lastName: localize(locale, `Зорчигч`, "Traveler"),
      fullName: localize(locale, `Зорчигч Нэр${index + 1}`, `Name${index + 1} Traveler`), email: `traveler${Math.floor(index / 2) + 1}@example.com`,
      nationality: ["MN", "KR", "US", "DE"][index % 4]!, documentReadiness: ["READY", "MISSING", "EXPIRING", "REVIEW"][index % 4]!, visaStatus: ["NOT_REQUIRED", "APPROVED", "PENDING", "MISSING"][index % 4]!,
      dietaryRequirements: index % 5 === 0 ? localize(locale, "Цагаан хоол", "Vegetarian") : "—", createdAt: now,
    };
  });
}

function destinationModels(locale: "mn" | "en") {
  const names = [["seoul", "Сөүл", "Seoul", "East Asia"], ["europe", "Европ", "Europe", "Europe"], ["gobi", "Говь", "Gobi", "Mongolia"], ["altai", "Алтай", "Altai", "Mongolia"], ["khuvsgul", "Хөвсгөл", "Khuvsgul", "Mongolia"], ["tokyo", "Токио", "Tokyo", "East Asia"], ["samarkand", "Самарканд", "Samarkand", "Central Asia"], ["bali", "Бали", "Bali", "Southeast Asia"]] as const;
  return names.map((item, index) => ({ id: id(12, index + 1), slug: item[0], name: locale === "mn" ? item[1] : item[2], region: item[3], summary: localize(locale, `${item[1]} руу утга учиртай, нягт нямбай аял.`, `Travel deeper through ${item[2]} with local perspective.`), image: { url: imagePaths[index % 4]!, alt: locale === "mn" ? `${item[1]} аяллын төрх` : `${item[2]} travel landscape` }, tourCount: index % 3 + 1, featured: index < 4 }));
}

function storefrontTourSummary(locale: "mn" | "en", tour: ReturnType<typeof tours>[number], departureRows = departures(locale)) {
  const related = departureRows.filter((item) => item.tourId === tour.id && item.status !== "CANCELLED");
  const next = related[0];
  const remaining = next ? Math.max(0, next.capacity - next.confirmedCount - next.heldCount) : 0;
  return {
    id: tour.id, slug: tour.slug, name: tour.name, summary: tour.summary, heroImage: { url: tour.heroImageUrl, alt: tour.name }, category: tour.category,
    destinations: tour.destinations, durationDays: tour.durationDays, priceFrom: money(tour.basePriceMinor), nextAvailableOn: next?.startsOn ?? null,
    availabilityLabel: remaining === 0 ? "SOLD_OUT" as const : remaining <= 4 ? "LIMITED" as const : "AVAILABLE" as const,
    promotion: tour.slug === "seoul-city-experience" ? { code: "SEOUL10", label: localize(locale, "Сөүлд 10% хэмнэх", "Save 10% on Seoul") } : null,
  };
}

function adminResources(locale: "mn" | "en") {
  const bookingRows = bookings(locale);
  const travelerRows = travelers(locale);
  const customers = bookingRows.map((booking, index) => ({ id: id(9, index + 1), fullName: booking.customerName, firstName: booking.customerName.split(" ")[0], lastName: booking.customerName.split(" ").slice(1).join(" "), email: booking.organizerEmail, segment: ["VIP", "REPEAT", "STANDARD"][index % 3]!, source: booking.source, bookingCount: index % 5 + 1, lifetimeValueMinor: booking.totalMinor * (index % 5 + 1), nextTrip: booking.tourName, createdAt: booking.createdAt }));
  const invoices = bookingRows.map((booking, index) => ({ id: id(6, index + 1), bookingId: booking.id, bookingNumber: booking.bookingNumber, customerName: booking.customerName, invoiceNumber: `INV-2026-${String(index + 1).padStart(4, "0")}`, status: ["PAID", "PARTIAL", "OVERDUE", "ISSUED"][index % 4]!, totalMinor: booking.totalMinor, paidMinor: booking.paidMinor, currency: "MNT", issuedAt: booking.createdAt, dueAt: `2026-09-${String(index % 24 + 1).padStart(2, "0")}T09:00:00+08:00` }));
  const payments = bookingRows.slice(0, 42).map((booking, index) => ({ id: id(7, index + 1), bookingId: booking.id, bookingNumber: booking.bookingNumber, customerName: booking.customerName, provider: ["QPAY", "STRIPE", "BANK_TRANSFER"][index % 3]!, providerTransactionId: `TXN-${String(index + 1001)}`, status: ["PAID", "PARTIALLY_PAID", "FAILED", "UNPAID"][index % 4]!, amountMinor: booking.paidMinor || Math.round(booking.totalMinor / 2), currency: "MNT", reconciliationStatus: ["MATCHED", "PENDING", "UNMATCHED"][index % 3]!, createdAt: booking.createdAt }));
  const documents = travelerRows.slice(0, 72).map((traveler, index) => ({ id: id(10, index + 1), bookingId: traveler.bookingId, bookingNumber: traveler.bookingNumber, travelerName: traveler.fullName, departureCode: traveler.departureCode, title: localize(locale, `${traveler.fullName} — Паспорт`, `${traveler.fullName} — Passport`), type: ["PASSPORT", "VISA", "INSURANCE", "VOUCHER"][index % 4]!, visibility: index % 4 === 3 ? "TRAVELER" : "STAFF", status: ["READY", "MISSING", "EXPIRING", "REVIEW"][index % 4]!, contentType: "application/pdf", expiresAt: index % 4 === 2 ? "2026-10-12T00:00:00+08:00" : null, createdAt: now }));
  const conversations = bookingRows.slice(0, 24).map((booking, index) => ({ id: id(11, index + 1), subject: localize(locale, ["Нислэгийн мэдээлэл", "Визийн зөвлөгөө", "Төлбөрийн хуваарь"][index % 3]!, ["Flight details", "Visa guidance", "Payment schedule"][index % 3]!), customerName: booking.customerName, bookingId: booking.id, bookingNumber: booking.bookingNumber, departureCode: booking.departureCode, channel: ["EMAIL", "WHATSAPP", "PORTAL"][index % 3]!, status: index % 5 === 0 ? "WAITING" : "OPEN", unreadCount: index % 4, preview: localize(locale, "Сүүлийн мессежийн товч агуулга…", "Latest message preview…"), updatedAt: booking.createdAt }));
  const promotions = [
    { id: id(13, 1), code: "SEOUL10", name: localize(locale, "Сөүл 10", "Seoul 10"), description: localize(locale, "Сөүлийн аялалд 10% хөнгөлөлт", "10% off Seoul departures"), benefit: "10%", presentation: "HERO", status: "ACTIVE", startsAt: "2026-08-01T00:00:00+08:00", endsAt: "2026-09-30T23:59:59+08:00", redemptionLimit: 80, redemptions: 31 },
    { id: id(13, 2), code: "EARLYBIRD", name: localize(locale, "Эрт захиалга", "Early bird"), description: localize(locale, "2027 аяллын урьдчилсан урамшуулал", "Advance offer for 2027 journeys"), benefit: "₮ 450,000", presentation: "BANNER", status: "SCHEDULED", startsAt: "2026-10-01T00:00:00+08:00", endsAt: "2026-12-15T23:59:59+08:00", redemptionLimit: 120, redemptions: 0 },
    { id: id(13, 3), code: "GOBI15", name: localize(locale, "Говь 15", "Gobi 15"), description: localize(locale, "Говийн улирлын төгсгөл", "Gobi season finale"), benefit: "15%", presentation: "COUPON", status: "EXPIRED", startsAt: "2026-05-01T00:00:00+08:00", endsAt: "2026-07-31T23:59:59+08:00", redemptionLimit: 50, redemptions: 48 },
  ];
  return { bookings: bookingRows, travelers: travelerRows, customers, invoices, payments, documents, conversations, promotions };
}

function travelerTrip(locale: "mn" | "en") {
  return {
    booking: { id: id(5, 1), bookingNumber: "TOMS-26-0101", status: "CONFIRMED" as const },
    trip: { tourName: localize(locale, "Сөүл хотын аялал", "Seoul City Experience"), heroImageUrl: "/images/seoul.png", startsOn: "2026-09-04", endsOn: "2026-09-08", daysUntilDeparture: 13 },
    readiness: { overallPercent: 72, documentsPercent: 60, paymentsPercent: 75, travelerInfoPercent: 100 },
    actionsRequired: [
      { type: "DOCUMENT" as const, severity: "CRITICAL" as const, title: localize(locale, "Хоёр дахь зорчигчийн паспорт оруулах", "Upload the second traveler's passport"), href: `/account/trips/${id(5, 1)}/documents` },
      { type: "PAYMENT" as const, severity: "WARNING" as const, title: localize(locale, "Үлдэгдэл төлбөр 8-р сарын 29-нд", "Balance payment due 29 August"), href: `/account/trips/${id(5, 1)}/payments` },
    ],
    travelers: [{ id: id(8, 1), fullName: localize(locale, "Бат Эрдэнэ", "Bat Erdene"), nationality: "MN" }, { id: id(8, 2), fullName: localize(locale, "Саруул Төмөр", "Saruul Tumur"), nationality: "MN" }],
    nextEvent: { title: localize(locale, "Инчон нисэх буудалд угтах", "Incheon airport welcome"), startsAt: "2026-09-04T14:30:00+09:00" },
    paymentSummary: { totalMinor: 5_780_000, paidMinor: 4_335_000, dueMinor: 1_445_000, currency: "MNT" },
    documentSummary: { required: 6, ready: 4, missing: 2 },
  };
}

export function createDemoServices(): ApiServices {
  return {
    identity: { async resolveActor() { return { userId: demoAccessToken.userId, tenantId, role: "OWNER", claims: demoAccessToken.claims }; } },
    tours: {
      async list(_actor, query) { const rows = tours(query.locale ?? "mn"); return { data: paginate(rows, query), items: paginate(rows, query), page: page(rows.length, query) }; },
      async create(_actor, input) { return { id: id(2, 99), status: "DRAFT", ...(input as Record<string, unknown>) }; },
      async publish(_actor, tourId) { return { id: tourId, status: "PUBLISHED" }; },
      async get(_actor, tourId, locale) { const tour = tours(locale).find((item) => item.id === tourId); if (!tour) throw new Error("TOUR_NOT_FOUND"); return { ...tour, departures: departures(locale).filter((item) => item.tourId === tourId) }; },
    },
    departures: {
      async list() { const rows = departures("mn"); return { data: rows, items: rows, page: page(rows.length) }; },
      async create(_actor, input) { return { id: id(3, 99), status: "DRAFT", confirmedCount: 0, heldCount: 0, ...(input as Record<string, unknown>) }; },
      async get(_actor, departureId) { const result = departures("mn").find((item) => item.id === departureId); if (!result) throw new Error("DEPARTURE_NOT_FOUND"); return result; },
      async readiness(_actor, departureId) { const result = departures("mn").find((item) => item.id === departureId); if (!result) throw new Error("DEPARTURE_NOT_FOUND"); return { departureId, overallPercent: result.readinessPercent, checks: [{ id: "documents", label: "Traveler documents", status: result.documentReadinessPercent > 80 ? "READY" : "ATTENTION", percent: result.documentReadinessPercent }, { id: "suppliers", label: "Supplier confirmations", status: result.riskCount > 3 ? "AT_RISK" : "READY", percent: result.riskCount > 3 ? 54 : 94 }, { id: "payments", label: "Payment completion", status: "ATTENTION", percent: 76 }, { id: "manifest", label: "Manifest readiness", status: "READY", percent: 91 }] }; },
      async manifest(_actor, departureId) { const result = departures("mn").find((item) => item.id === departureId); if (!result) throw new Error("DEPARTURE_NOT_FOUND"); const items = travelers("mn").filter((item) => item.departureCode === result.code); return { departureId, items, summary: { travelers: items.length, documentsReady: items.filter((item) => item.documentReadiness === "READY").length, visaAttention: items.filter((item) => ["MISSING", "PENDING"].includes(item.visaStatus)).length } }; },
    },
    dashboard: {
      async read(_actor, locale) {
        const bookingRows = bookings(locale); const departureRows = departures(locale);
        return {
          metrics: { grossBookingValue: money(bookingRows.reduce((sum, item) => sum + item.totalMinor, 0)), confirmedBookings: bookingRows.filter((item) => item.status === "CONFIRMED").length, upcomingDepartures: departureRows.filter((item) => item.status !== "CANCELLED").length, travelers: 96, averageBookingValue: money(Math.round(bookingRows.reduce((sum, item) => sum + item.totalMinor, 0) / bookingRows.length)) },
          trend: Array.from({ length: 12 }, (_, index) => ({ period: `2025-${String(index + 9).padStart(2, "0")}`.replace("2025-13", "2026-01").replace("2025-14", "2026-02").replace("2025-15", "2026-03").replace("2025-16", "2026-04").replace("2025-17", "2026-05").replace("2025-18", "2026-06").replace("2025-19", "2026-07").replace("2025-20", "2026-08"), bookingValueMinor: 72_000_000 + index * 8_750_000, bookingCount: 18 + index * 2 })),
          departureHealth: { ready: 7, attention: 5, atRisk: 4, averageOccupancyPercent: 71 },
          risks: [{ id: "risk-1", severity: "CRITICAL", title: localize(locale, "ALT-26-04 нислэг баталгаажаагүй", "ALT-26-04 flights unconfirmed"), dueOn: "2026-08-24", href: `/departures/${id(3, 4)}` }, { id: "risk-2", severity: "WARNING", title: localize(locale, "6 паспорт дутуу", "6 passports missing"), dueOn: "2026-08-27", href: "/documents" }],
          upcomingDepartures: departureRows.slice(0, 6), recentBookings: bookingRows.slice(0, 6), bookingsByStatus: ["CONFIRMED", "HELD", "PENDING", "CANCELLED"].map((status) => ({ status, count: bookingRows.filter((item) => item.status === status).length })),
        };
      },
    },
    backoffice: {
      async list(_actor, resource, locale, query) {
        const rows = adminResources(locale)[resource]; const q = query?.q?.toLowerCase();
        const filtered = q ? rows.filter((item) => JSON.stringify(item).toLowerCase().includes(q)) : rows;
        return { data: paginate(filtered, query), items: paginate(filtered, query), page: page(filtered.length, query), summary: { total: filtered.length } };
      },
    },
    storefront: {
      async bootstrap(_host, locale) { return { tenant: { id: tenantId, slug: "munkh-discovery", name: "Munkh Discovery" }, brand: { wordmark: "MUNKH DISCOVERY", theme: { primary: "#09182f", accent: "#ba9558", surface: "#f7f3ea" } }, navigation: [{ label: localize(locale, "Аяллууд", "Tours"), href: "/tours" }, { label: localize(locale, "Чиглэл", "Destinations"), href: "/destinations" }, { label: localize(locale, "Урамшуулал", "Promotions"), href: "/promotions" }], footer: { description: localize(locale, "Монголд төрсөн, дэлхийгээр аялуулдаг travel atelier.", "A Mongolia-born travel atelier for journeys worldwide."), groups: [{ label: localize(locale, "Судлах", "Explore"), links: [{ label: localize(locale, "Аяллууд", "Tours"), href: "/tours" }, { label: localize(locale, "Бидний тухай", "About"), href: "/about" }] }] }, locale, currency: "MNT" }; },
      async home(_host, locale) { const published = tours(locale).filter((item) => item.status === "PUBLISHED"); return { hero: { eyebrow: localize(locale, "MUNKH DISCOVERY", "MUNKH DISCOVERY"), title: localize(locale, "Дэлхийг өөрийнхөөрөө нээ", "See the world, your way"), description: localize(locale, "Жижиг бүлэг, орон нутгийн эксперт, мартагдашгүй аяллууд.", "Small groups, local experts and journeys that stay with you."), image: { url: "/images/altai.png", alt: localize(locale, "Алтайн уулсын оройн гэрэл", "Golden light over the Altai mountains") }, primaryAction: { label: localize(locale, "Аялал судлах", "Explore journeys"), href: "/tours" } }, search: { destinations: destinationModels(locale).map((item) => ({ value: item.slug, label: item.name })), months: [{ value: "2026-09", label: localize(locale, "2026 оны 9 сар", "September 2026") }, { value: "2026-10", label: localize(locale, "2026 оны 10 сар", "October 2026") }] }, featuredTours: published.slice(0, 4).map((item) => storefrontTourSummary(locale, item)), featuredDestinations: destinationModels(locale).slice(0, 4), promotion: { title: localize(locale, "Сөүлийн намар — 10% хэмнээрэй", "Seoul in autumn — save 10%"), description: localize(locale, "9-р сарын сонгосон departure-д.", "On selected September departures."), href: "/promotions", image: { url: "/images/seoul.png", alt: localize(locale, "Сөүлийн шөнийн хот", "Seoul city lights") } }, editorial: [{ id: "editorial-1", eyebrow: localize(locale, "ЯАГААД БИД", "WHY MUNKH"), title: localize(locale, "Бид хаашаа биш, хэрхэн аялахыг бүтээдэг", "We design how you travel, not only where"), body: localize(locale, "Орон нутгийн харилцаа, ухаалаг хэмнэл, жинхэнэ зочломтгой байдал.", "Local relationships, considered pacing and genuine hospitality."), image: { url: "/images/gobi.png", alt: localize(locale, "Говийн аяллын агшин", "A quiet moment in the Gobi") }, href: "/about" }], trustItems: [{ id: "trust-1", title: localize(locale, "24/7 дэмжлэг", "24/7 journey support"), description: localize(locale, "Аяллын өмнө ба туршид.", "Before and throughout your trip.") }, { id: "trust-2", title: localize(locale, "Жижиг бүлэг", "Small by design"), description: localize(locale, "Илүү ойр, илүү утга учиртай.", "More personal, more meaningful.") }, { id: "trust-3", title: localize(locale, "Орон нутгийн эксперт", "Locally led"), description: localize(locale, "Газрын мэдлэгтэй хүмүүстэй.", "Hosted by people who know the place.") }] }; },
      async listTours(_host, locale, query) { let rows = tours(locale).filter((item) => item.status === "PUBLISHED"); if (query?.q) rows = rows.filter((item) => JSON.stringify(item).toLowerCase().includes(query.q!.toLowerCase())); const items = paginate(rows, query).map((item) => storefrontTourSummary(locale, item)); return { items, page: page(rows.length, query), facets: { destinations: destinationModels(locale).map((item) => ({ value: item.slug, label: item.name, count: item.tourCount })), categories: ["CULTURE", "NATURE", "ADVENTURE", "CULINARY", "FAMILY"].map((value) => ({ value, label: value, count: rows.filter((item) => item.category === value).length })), months: [{ value: "2026-09", label: "September 2026", count: 6 }, { value: "2026-10", label: "October 2026", count: 7 }] }, sortOptions: [{ value: "featured", label: localize(locale, "Онцлох", "Featured") }, { value: "price-asc", label: localize(locale, "Үнэ өсөхөөр", "Price: low to high") }] }; },
      async getTour(_host, slug, locale) { const tour = tours(locale).find((item) => item.slug === slug && item.status === "PUBLISHED"); if (!tour) throw new Error("TOUR_NOT_FOUND"); const departureRows = departures(locale).filter((item) => item.tourId === tour.id && item.status !== "CANCELLED"); return { id: tour.id, slug: tour.slug, status: "PUBLISHED" as const, hero: { title: tour.name, eyebrow: tour.destinations.join(" · "), summary: tour.summary, image: { url: tour.heroImageUrl, alt: tour.name } }, facts: { durationDays: tour.durationDays, durationNights: tour.durationNights, difficulty: tour.difficulty, groupSize: { min: 4, max: 18 }, destinations: tour.destinations }, priceFrom: money(tour.basePriceMinor), highlights: tour.highlights, story: [{ type: "IMAGE_TEXT" as const, title: localize(locale, "Аяллын түүх", "The journey"), body: tour.description, image: { url: imagePaths[(tourSeed.findIndex((item) => item[0] === slug) + 1) % 4]!, alt: tour.name } }], itinerary: Array.from({ length: Math.min(tour.durationDays, 5) }, (_, index) => ({ day: index + 1, title: localize(locale, `${index + 1}-р өдрийн онцлох аялал`, `Day ${index + 1} signature experience`), description: localize(locale, "Өглөөг тайван эхлүүлж, орон нутгийн эксперттэй гол газруудыг нээнэ.", "Begin slowly, then explore defining places with a local host.") })), gallery: imagePaths.map((url, index) => ({ url, alt: `${tour.name} — ${index + 1}` })), included: tour.inclusions, excluded: tour.exclusions, faq: [{ question: localize(locale, "Энэ аялал хэнд тохиромжтой вэ?", "Who is this journey for?"), answer: localize(locale, "Соёл, тав тух, орон нутгийн бодит туршлагыг хослуулахыг хүссэн аялагчдад.", "Travelers seeking a considered balance of culture, comfort and local depth.") }], departures: departureRows.map((departure) => { const remaining = Math.max(0, departure.capacity - departure.confirmedCount - departure.heldCount); return { id: departure.id, startsOn: departure.startsOn, endsOn: departure.endsOn, status: departure.status as "OPEN" | "GUARANTEED" | "SOLD_OUT" | "CANCELLED", availability: { remaining, capacity: departure.capacity, label: remaining === 0 ? "SOLD_OUT" as const : remaining <= 4 ? "LIMITED" as const : "AVAILABLE" as const, percent: Math.round(departure.confirmedCount / departure.capacity * 100) }, price: money(departure.priceMinor), bookingDeadline: departure.bookingDeadline }; }) }; },
      async listDestinations(_host, locale, query) { const rows = destinationModels(locale); return { items: paginate(rows, query), page: page(rows.length, query), regions: [...new Set(rows.map((item) => item.region))] }; },
      async getDestination(_host, slug, locale) { const destination = destinationModels(locale).find((item) => item.slug === slug); if (!destination) throw new Error("DESTINATION_NOT_FOUND"); return { ...destination, hero: destination.image, tours: tours(locale).filter((item) => item.destinations.some((value) => value.toLowerCase() === destination.name.toLowerCase())).map((item) => storefrontTourSummary(locale, item)) }; },
      async getDeparture(_host, departureId, locale) { const departure = departures(locale).find((item) => item.id === departureId); if (!departure) throw new Error("DEPARTURE_NOT_FOUND"); const tour = tours(locale).find((item) => item.id === departure.tourId)!; const remaining = Math.max(0, departure.capacity - departure.confirmedCount - departure.heldCount); return { id: departure.id, code: departure.code, tour: storefrontTourSummary(locale, tour), startsOn: departure.startsOn, endsOn: departure.endsOn, status: departure.status, availability: { remaining, capacity: departure.capacity, label: remaining === 0 ? "SOLD_OUT" : remaining <= 4 ? "LIMITED" : "AVAILABLE", percent: Math.round(departure.confirmedCount / departure.capacity * 100) }, price: money(departure.priceMinor), bookingDeadline: departure.bookingDeadline, itineraryPreview: Array.from({ length: 4 }, (_, index) => ({ day: index + 1, title: localize(locale, `${index + 1}-р өдрийн хөтөлбөр`, `Day ${index + 1} itinerary`) })), inclusions: tour.inclusions }; },
      async availability(_host, departureId, locale) { const departure = departures(locale).find((item) => item.id === departureId); if (!departure) throw new Error("DEPARTURE_NOT_FOUND"); return { departureId, capacity: departure.capacity, confirmed: departure.confirmedCount, held: departure.heldCount, remaining: Math.max(0, departure.capacity - departure.confirmedCount - departure.heldCount), checkedAt: now }; },
      async checkoutContext(_host, departureId, locale) { const departure = departures(locale).find((item) => item.id === departureId); if (!departure) throw new Error("DEPARTURE_NOT_FOUND"); const tour = tours(locale).find((item) => item.id === departure.tourId)!; return { holdPolicy: { durationMinutes: 15 }, tour: { slug: tour.slug, name: tour.name, heroImageUrl: tour.heroImageUrl }, departure: { id: departure.id, startsOn: departure.startsOn, endsOn: departure.endsOn, remainingCapacity: Math.max(0, departure.capacity - departure.confirmedCount - departure.heldCount) }, pricing: { currency: "MNT", perTravelerMinor: departure.priceMinor, feesMinor: 0, eligiblePromotions: tour.slug === "seoul-city-experience" ? [{ code: "SEOUL10", label: "10%", discountMinor: Math.round(departure.priceMinor * .1) }] : [] }, requirements: { travelerFields: ["fullName", "nationality", "dateOfBirth", "dietaryRequirements", "specialRequirements"] }, paymentMethods: ["QPAY", "STRIPE", "DEMO"] }; },
      async promotions(_host, locale, query) { const rows = adminResources(locale).promotions.filter((item) => item.status === "ACTIVE"); return { items: paginate(rows, query), page: page(rows.length, query), featured: rows[0] ?? null }; },
      async page(_host, slug, locale) { const supported = ["about", "contact"]; if (!supported.includes(slug)) throw new Error("PAGE_NOT_FOUND"); return { slug, title: slug === "about" ? localize(locale, "Бидний тухай", "About us") : localize(locale, "Холбоо барих", "Contact"), blocks: [{ id: `${slug}-hero`, type: "HERO", content: { title: slug === "about" ? localize(locale, "Аяллыг илүү утга учиртай болгоно", "Travel made more meaningful") : localize(locale, "Бидэнтэй аяллаа ярилцаарай", "Let's plan your journey"), imageUrl: "/images/altai.png" } }, { id: `${slug}-story`, type: "IMAGE_TEXT", content: { title: localize(locale, "Монголд төрсөн travel atelier", "A travel atelier born in Mongolia"), body: localize(locale, "Бид орон нутгийн харилцаа, нягт нямбай төлөвлөлтөөр аялал бүтээдэг.", "We create journeys through local relationships and thoughtful operations."), imageUrl: "/images/gobi.png" } }] }; },
    },
    bookings: {
      async createHold(_host, input, idempotencyKey) { return { id: "51111111-1111-4111-8111-111111111111", expiresAt: "2026-08-22T08:15:00+08:00", idempotencyKey, ...(input as Record<string, unknown>) }; },
      async checkout(_host, input, idempotencyKey) { return { id: "51111111-1111-4111-8111-111111111111", bookingNumber: "TOMS-26-0101", organizerEmail: "bat@example.com", status: "CONFIRMED", paymentStatus: "PAID", totalMinor: 5_780_000, currency: "MNT", idempotencyKey, ...(input as Record<string, unknown>) }; },
    },
    traveler: {
      async list(_token, locale) { const current = travelerTrip(locale); return { items: [current], page: page(1) }; },
      async get(_token, _bookingId, locale) { return travelerTrip(locale); },
      async dashboard(_token, locale) { return { currentTrip: travelerTrip(locale), latestMessage: { id: id(11, 1), subject: localize(locale, "Сөүл аяллын нислэгийн мэдээлэл", "Flight details for Seoul"), preview: localize(locale, "Инчон нисэх буудлын угтах цэг шинэчлэгдлээ.", "Your Incheon airport meeting point is confirmed."), createdAt: now } }; },
      async timeline(_token, _bookingId, locale) { return { items: Array.from({ length: 5 }, (_, index) => ({ id: id(14, index + 1), day: index + 1, startsAt: `2026-09-0${index + 4}T09:00:00+09:00`, title: localize(locale, `${index + 1}-р өдрийн аялал`, `Day ${index + 1} experience`), location: localize(locale, "Сөүл", "Seoul"), details: localize(locale, "Орон нутгийн хөтөчтэй өдрийн хөтөлбөр.", "A considered day hosted by a local expert.") })) }; },
      async documents(_token, _bookingId, locale) { return { readinessPercent: 67, summary: { required: 6, ready: 4, missing: 1, expiring: 1 }, items: [{ id: id(10, 1), title: localize(locale, "Бат — Паспорт", "Bat — Passport"), type: "PASSPORT", travelerName: localize(locale, "Бат Эрдэнэ", "Bat Erdene"), status: "READY", expiresOn: "2031-06-18", downloadUrl: "/documents/passport.pdf" }, { id: id(10, 2), title: localize(locale, "Саруул — Паспорт", "Saruul — Passport"), type: "PASSPORT", travelerName: localize(locale, "Саруул Төмөр", "Saruul Tumur"), status: "MISSING", expiresOn: null, downloadUrl: null }, { id: id(10, 3), title: localize(locale, "Аяллын даатгал", "Travel insurance"), type: "INSURANCE", travelerName: localize(locale, "Бүх зорчигч", "All travelers"), status: "EXPIRING", expiresOn: "2026-09-06", downloadUrl: "/documents/insurance.pdf" }] }; },
      async payments(_token, _bookingId, locale) { void locale; return { total: money(5_780_000), paid: money(4_335_000), due: money(1_445_000), paymentStatus: "PARTIALLY_PAID", schedule: [{ id: "pay-schedule-1", label: "75% deposit", amount: money(4_335_000), dueOn: "2026-08-10", status: "PAID" }, { id: "pay-schedule-2", label: "Final balance", amount: money(1_445_000), dueOn: "2026-08-29", status: "DUE" }], transactions: [{ id: id(7, 1), reference: "QPAY-10031", amount: money(4_335_000), status: "SUCCEEDED", createdAt: "2026-08-10T11:20:00+08:00" }] }; },
      async messages(_token, locale) { return { conversations: [{ id: id(11, 1), subject: localize(locale, "Сөүл аяллын нислэг", "Seoul flight details"), bookingNumber: "TOMS-26-0101", unreadCount: 1, updatedAt: now }], activeConversation: { id: id(11, 1), subject: localize(locale, "Сөүл аяллын нислэг", "Seoul flight details"), messages: [{ id: "message-1", sender: "STAFF", body: localize(locale, "Инчон нисэх буудлын B гарц дээр уулзана.", "We will meet at Incheon Airport, Gate B."), createdAt: now }, { id: "message-2", sender: "TRAVELER", body: localize(locale, "Баярлалаа, ойлголоо.", "Thank you, understood."), createdAt: "2026-08-22T08:12:00+08:00" }] } }; },
      async profile(_token, locale) { return { id: demoAccessToken.userId, fullName: localize(locale, "Бат Эрдэнэ", "Bat Erdene"), email: "bat@example.com", phone: "+976 9911 2233", nationality: "MN", locale, dietaryRequirements: localize(locale, "Цагаан хоол", "Vegetarian"), specialRequirements: "", emergencyContact: { name: localize(locale, "Болор Эрдэнэ", "Bolor Erdene"), relationship: localize(locale, "Эгч", "Sister"), phone: "+976 8811 2233" } }; },
      async updateProfile(_token, input, locale) { return { ...await this.profile(_token, locale) as object, ...(input as object) }; },
    },
  };
}
