import type { BookingStatus, HoldStatus, PaymentStatus } from "@toms/domain";

export interface TenantView {
  id: string;
  slug: string;
  name: string;
  defaultCurrency: string;
  locale: string;
}

export interface DepartureView {
  id: string;
  tourId: string;
  code: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  confirmedCount: number;
  priceMinor: number;
  currency: string;
  status: "DRAFT" | "OPEN" | "GUARANTEED" | "SOLD_OUT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface TourView {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  basePriceMinor: number;
  currency: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  destinations: string[];
  heroImageUrl: string;
  highlights: string[];
  inclusions: string[];
  departures: DepartureView[];
}

export interface ItineraryEventView {
  id: string;
  departureId: string;
  dayNumber: number;
  startsAt: string;
  title: string;
  location: string;
  details: string;
  visibility: "STAFF" | "TRAVELER";
  internalNote: string;
}

export interface HoldView {
  id: string;
  departureId: string;
  partySize: number;
  status: HoldStatus;
  expiresAt: string;
  idempotencyKey: string;
}

export interface BookingView {
  id: string;
  bookingNumber: string;
  departureId: string;
  tourId: string;
  organizerEmail: string;
  payerName: string;
  travelers: Array<{ id: string; fullName: string; nationality: string }>;
  partySize: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  totalMinor: number;
  invoiceNumber: string;
  createdAt: string;
}

export interface DashboardView {
  metrics: {
    grossBookingValueMinor: number;
    confirmedBookings: number;
    upcomingDepartures: number;
    travelers: number;
    storefrontConversion: number;
  };
  revenueTrend: number[];
  bookingsByStatus: Array<{ status: string; count: number }>;
  upcomingDepartures: Array<{ id: string; tourName: string; startsOn: string; confirmedCount: number; capacity: number; status: string }>;
}

