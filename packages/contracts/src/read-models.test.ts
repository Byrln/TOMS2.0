import { describe, expect, it } from "vitest";
import {
  adminDashboardResponseSchema,
  listPageSchema,
  moneySchema,
  storefrontBootstrapResponseSchema,
  storefrontTourDetailResponseSchema,
  travelerTripResponseSchema,
} from "./index";

describe("TOMS read-model contracts", () => {
  it("transfers currency only as integer minor units", () => {
    expect(moneySchema.parse({ amountMinor: 4_950_000, currency: "MNT" })).toEqual({
      amountMinor: 4_950_000,
      currency: "MNT",
    });
    expect(() => moneySchema.parse({ amountMinor: 49.5, currency: "MNT" })).toThrow();
    expect(() => moneySchema.parse({ amountMinor: 4950, currency: "₮" })).toThrow();
  });

  it("requires complete collection pagination metadata", () => {
    expect(listPageSchema.parse({ page: 2, pageSize: 25, total: 76, pageCount: 4 })).toEqual({
      page: 2,
      pageSize: 25,
      total: 76,
      pageCount: 4,
    });
    expect(() => listPageSchema.parse({ page: 1, pageSize: 25, total: 76 })).toThrow();
  });

  it("keeps dashboard trend periods and operational risk targets", () => {
    const parsed = adminDashboardResponseSchema.parse({
      period: {
        range: "30d",
        from: "2026-07-24",
        to: "2026-08-22",
        comparisonFrom: "2026-06-24",
        comparisonTo: "2026-07-23",
      },
      metrics: {
        confirmedBookingValue: { amountMinor: 156_420_000, currency: "MNT", changePercent: 12.4 },
        confirmedBookings: { count: 128, changePercent: 8.2 },
        upcomingDepartures: { count: 12, withinSevenDays: 3 },
        travelersTravelingSoon: { count: 342, change: 31 },
        outstandingBalance: { amountMinor: 18_600_000, currency: "MNT", bookingCount: 14 },
      },
      trend: [{ period: "2026-07-24", bookingValueMinor: 4_200_000, bookingCount: 4 }],
      departureHealth: { averageOccupancyPercent: 76, soldOutCount: 2, atRiskCount: 3, fullyReadyCount: 7 },
      risks: [{ id: "risk_01", severity: "CRITICAL", type: "DOCUMENT_MISSING", title: "Passport missing", description: "Seoul · 24 days", departureId: "dep_sel", href: "/departures/dep_sel?panel=documents" }],
      upcomingDepartures: [],
      recentBookings: [],
    });

    expect(parsed.trend[0]?.period).toBe("2026-07-24");
    expect(parsed.risks[0]?.href).toContain("/departures/");
    expect(() => adminDashboardResponseSchema.parse({ ...parsed, revenueTrend: [1, 2, 3] })).toThrow();
  });

  it("keeps Storefront bootstrap separate from home and tour payloads", () => {
    const bootstrap = storefrontBootstrapResponseSchema.parse({
      tenant: { id: "tenant_munkh", slug: "munkh-discovery", name: "Munkh Discovery" },
      brand: { wordmark: "Munkh Discovery", theme: { primary: "#071F38", accent: "#C6A15B", surface: "#F8F6F1" } },
      navigation: [{ label: "Tours", href: "/tours" }],
      footer: { description: "Curated journeys from Mongolia.", groups: [] },
      locale: "en",
      currency: "MNT",
    });
    expect(bootstrap.navigation[0]?.href).toBe("/tours");
    expect(() => storefrontBootstrapResponseSchema.parse({ ...bootstrap, featuredTours: [] })).toThrow();

    const tour = storefrontTourDetailResponseSchema.parse({
      id: "tour_alt",
      slug: "altai-adventure",
      status: "PUBLISHED",
      hero: { title: "Altai Adventure", eyebrow: "MONGOLIA · ADVENTURE", summary: "Eight days in the Altai.", image: { url: "/images/altai.png", alt: "Altai mountains" } },
      facts: { durationDays: 8, durationNights: 7, difficulty: "MODERATE", groupSize: { min: 6, max: 14 }, destinations: ["Bayan-Ulgii"] },
      priceFrom: { amountMinor: 4_950_000, currency: "MNT" },
      highlights: ["Tavan Bogd"],
      story: [{ type: "TEXT", title: "High country", body: "Travel with local eagle hunters." }],
      itinerary: [{ day: 1, title: "Arrive in Ulgii", description: "Meet the expedition team." }],
      gallery: [{ url: "/images/altai.png", alt: "Altai ridge at sunrise" }],
      included: ["Guide"],
      excluded: ["Personal insurance"],
      faq: [{ question: "How difficult is it?", answer: "Moderate walking." }],
      departures: [],
    });
    expect(tour.priceFrom.amountMinor).toBe(4_950_000);
  });

  it("separates traveler readiness, actions, payment, and documents", () => {
    const trip = travelerTripResponseSchema.parse({
      booking: { id: "booking_001", bookingNumber: "TOMS-260815-001", status: "CONFIRMED" },
      trip: { tourName: "Seoul City Experience", heroImageUrl: "/images/seoul.png", startsOn: "2026-09-15", endsOn: "2026-09-20", daysUntilDeparture: 24 },
      readiness: { overallPercent: 84, documentsPercent: 75, paymentsPercent: 100, travelerInfoPercent: 100 },
      actionsRequired: [{ type: "DOCUMENT", severity: "WARNING", title: "Upload passport copy", href: "/account/trips/booking_001/documents" }],
      travelers: [{ id: "traveler_001", fullName: "Bat-Orgil Munkhbat", nationality: "MN" }],
      nextEvent: { title: "Airport pickup", startsAt: "2026-09-15T11:00:00+09:00" },
      paymentSummary: { totalMinor: 3_960_000, paidMinor: 3_960_000, dueMinor: 0, currency: "MNT" },
      documentSummary: { required: 8, ready: 6, missing: 2 },
    });

    expect(trip.actionsRequired).toHaveLength(1);
    expect(trip.documentSummary.missing).toBe(2);
  });
});
