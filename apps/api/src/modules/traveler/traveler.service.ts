import { withUserRlsContext, type DatabaseClient, type VerifiedRlsClaims } from "@toms/db";
import type { VerifiedAccessToken } from "../../plugins/auth.plugin";
import { ApiError } from "../../shared/errors/api-error";
import { listTravelerBookings, readTravelerTrip } from "./traveler.repository";

function claimsFor(token: VerifiedAccessToken): VerifiedRlsClaims {
  return {
    sub: token.userId,
    role: "authenticated",
    iss: typeof token.claims.iss === "string" ? token.claims.iss : "",
    ...(token.claims.aud ? { aud: token.claims.aud } : {}),
    ...(typeof token.claims.email === "string" ? { email: token.claims.email } : {}),
  };
}

export function createTravelerService(client: DatabaseClient) {
  const service = {
    async list(token: VerifiedAccessToken, locale: "mn" | "en") {
      void locale;
      const rows = await withUserRlsContext(client.db, claimsFor(token), (tx) => listTravelerBookings(tx, token.userId));
      return { items: rows.map((row) => ({ ...row, totalMinor: Number(row.totalMinor), createdAt: row.createdAt.toISOString() })) };
    },
    async get(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en") {
      const result = await withUserRlsContext(client.db, claimsFor(token), (tx) => readTravelerTrip(tx, token.userId, bookingId, locale));
      if (!result) throw new ApiError(404, "BOOKING_NOT_FOUND", "Trip not found");
      return result;
    },
    async dashboard(token: VerifiedAccessToken, locale: "mn" | "en") {
      const bookings = await service.list(token, locale);
      const first = bookings.items[0];
      return { currentTrip: first ? await service.get(token, first.id, locale) : null, latestMessage: null };
    },
    async timeline(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en") {
      const trip = await service.get(token, bookingId, locale);
      return { items: trip.itinerary };
    },
    async documents(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en") {
      await service.get(token, bookingId, locale);
      return { readinessPercent: 0, summary: { required: 0, ready: 0, missing: 0, expiring: 0 }, items: [] };
    },
    async payments(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en") {
      const trip = await service.get(token, bookingId, locale);
      const paidMinor = trip.paymentStatus === "PAID" ? trip.totalMinor : 0;
      return { total: { amountMinor: trip.totalMinor, currency: trip.currency }, paid: { amountMinor: paidMinor, currency: trip.currency }, due: { amountMinor: trip.totalMinor - paidMinor, currency: trip.currency }, paymentStatus: trip.paymentStatus, schedule: [], transactions: [] };
    },
    async messages(token: VerifiedAccessToken, locale: "mn" | "en") {
      void token; void locale;
      return { conversations: [], activeConversation: null };
    },
    async profile(token: VerifiedAccessToken, locale: "mn" | "en") {
      const bookings = await service.list(token, locale);
      const first = bookings.items[0];
      if (!first) throw new ApiError(404, "PROFILE_NOT_FOUND", "Traveler profile not found");
      const trip = await service.get(token, first.id, locale);
      const traveler = trip.travelers[0];
      return { id: traveler?.id ?? token.userId, fullName: traveler?.fullName ?? "", email: first.organizerEmail, phone: "", nationality: traveler?.nationality ?? "", locale, dietaryRequirements: "", specialRequirements: "", emergencyContact: { name: "", relationship: "", phone: "" } };
    },
    async updateProfile(token: VerifiedAccessToken, input: unknown, locale: "mn" | "en") {
      return { ...await service.profile(token, locale), ...(typeof input === "object" && input !== null ? input : {}) };
    },
  };
  return service;
}
