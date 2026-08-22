import { z } from "zod";

export * from "./admin";
export * from "./common";
export * from "./storefront";
export * from "./traveler";

export const idempotencyKeySchema = z.string().min(8).max(128);

export const bookingHoldRequestSchema = z.object({
  departureId: z.uuid(),
  partySize: z.number().int().min(1).max(99),
  idempotencyKey: idempotencyKeySchema
});

export const payerSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.email(),
  phone: z.string().trim().min(6).max(32).optional()
});

export const travelerSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  nationality: z.string().length(2),
  dateOfBirth: z.iso.date().optional(),
  dietaryRequirements: z.string().max(500).optional()
});

export const checkoutRequestSchema = z.object({
  holdId: z.uuid(),
  payer: payerSchema,
  travelers: z.array(travelerSchema).min(1).max(99),
  paymentMethod: z.enum(["DEMO", "QPAY", "STRIPE"]),
  promotionCode: z.string().trim().max(48).optional(),
  termsAccepted: z.literal(true),
  idempotencyKey: idempotencyKeySchema
});

export const itineraryUpdateSchema = z.object({
  eventId: z.uuid(),
  title: z.string().trim().min(2).max(160),
  startsAt: z.iso.datetime({ offset: true }),
  location: z.string().trim().max(200).optional(),
  details: z.string().trim().max(1000).optional(),
  visibility: z.enum(["STAFF", "TRAVELER"])
});

export type BookingHoldRequest = z.infer<typeof bookingHoldRequestSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type ItineraryUpdate = z.infer<typeof itineraryUpdateSchema>;
