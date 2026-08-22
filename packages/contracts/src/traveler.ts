import { z } from "zod";
import { bookingStatusSchema, documentStatusSchema, paymentStatusSchema } from "./admin";
import { currencySchema, isoDateSchema, listPageSchema, moneySchema, offsetDateTimeSchema } from "./common";

export const travelerActionSchema = z.object({
  type: z.enum(["DOCUMENT", "PAYMENT", "TRAVELER_INFO", "MESSAGE"]),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  title: z.string().min(1),
  href: z.string().startsWith("/"),
}).strict();

export const travelerTripResponseSchema = z.object({
  booking: z.object({ id: z.string().min(1), bookingNumber: z.string().min(1), status: bookingStatusSchema }).strict(),
  trip: z.object({ tourName: z.string().min(1), heroImageUrl: z.string().min(1), startsOn: isoDateSchema, endsOn: isoDateSchema, daysUntilDeparture: z.number().int() }).strict(),
  readiness: z.object({ overallPercent: z.number().min(0).max(100), documentsPercent: z.number().min(0).max(100), paymentsPercent: z.number().min(0).max(100), travelerInfoPercent: z.number().min(0).max(100) }).strict(),
  actionsRequired: z.array(travelerActionSchema),
  travelers: z.array(z.object({ id: z.string().min(1), fullName: z.string().min(1), nationality: z.string().length(2) }).strict()),
  nextEvent: z.object({ title: z.string().min(1), startsAt: offsetDateTimeSchema }).strict().nullable(),
  paymentSummary: z.object({ totalMinor: z.number().int().min(0), paidMinor: z.number().int().min(0), dueMinor: z.number().int().min(0), currency: currencySchema }).strict(),
  documentSummary: z.object({ required: z.number().int().min(0), ready: z.number().int().min(0), missing: z.number().int().min(0) }).strict(),
}).strict();

export const travelerTripListItemSchema = travelerTripResponseSchema.pick({ booking: true, trip: true, readiness: true, actionsRequired: true });
export const travelerTripsResponseSchema = z.object({ items: z.array(travelerTripListItemSchema), page: listPageSchema }).strict();
export const travelerDashboardResponseSchema = z.object({ currentTrip: travelerTripResponseSchema.nullable(), latestMessage: z.object({ id: z.string().min(1), subject: z.string().min(1), preview: z.string().min(1), createdAt: offsetDateTimeSchema }).strict().nullable() }).strict();

export const travelerDocumentsResponseSchema = z.object({
  readinessPercent: z.number().min(0).max(100),
  summary: z.object({ required: z.number().int().min(0), ready: z.number().int().min(0), missing: z.number().int().min(0), expiring: z.number().int().min(0) }).strict(),
  items: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), type: z.string().min(1), travelerName: z.string().min(1), status: documentStatusSchema, expiresOn: isoDateSchema.nullable(), downloadUrl: z.string().min(1).nullable() }).strict()),
}).strict();

export const travelerPaymentsResponseSchema = z.object({
  total: moneySchema, paid: moneySchema, due: moneySchema, paymentStatus: paymentStatusSchema,
  schedule: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), amount: moneySchema, dueOn: isoDateSchema, status: z.enum(["PAID", "DUE", "OVERDUE", "SCHEDULED"]) }).strict()),
  transactions: z.array(z.object({ id: z.string().min(1), reference: z.string().min(1), amount: moneySchema, status: z.string().min(1), createdAt: offsetDateTimeSchema }).strict()),
}).strict();

export const travelerMessagesResponseSchema = z.object({
  conversations: z.array(z.object({ id: z.string().min(1), subject: z.string().min(1), bookingNumber: z.string().nullable(), unreadCount: z.number().int().min(0), updatedAt: offsetDateTimeSchema }).strict()),
  activeConversation: z.object({ id: z.string().min(1), subject: z.string().min(1), messages: z.array(z.object({ id: z.string().min(1), sender: z.enum(["TRAVELER", "STAFF"]), body: z.string().min(1), createdAt: offsetDateTimeSchema }).strict()) }).strict().nullable(),
}).strict();

export const travelerProfileResponseSchema = z.object({
  id: z.string().min(1), fullName: z.string().min(1), email: z.email(), phone: z.string().min(6), nationality: z.string().length(2), locale: z.enum(["mn", "en"]), dietaryRequirements: z.string(), specialRequirements: z.string(), emergencyContact: z.object({ name: z.string().min(1), relationship: z.string().min(1), phone: z.string().min(6) }).strict(),
}).strict();

export type TravelerTripResponse = z.infer<typeof travelerTripResponseSchema>;
export type TravelerDashboardResponse = z.infer<typeof travelerDashboardResponseSchema>;
export type TravelerTripsResponse = z.infer<typeof travelerTripsResponseSchema>;
export type TravelerDocumentsResponse = z.infer<typeof travelerDocumentsResponseSchema>;
export type TravelerPaymentsResponse = z.infer<typeof travelerPaymentsResponseSchema>;
export type TravelerMessagesResponse = z.infer<typeof travelerMessagesResponseSchema>;
export type TravelerProfileResponse = z.infer<typeof travelerProfileResponseSchema>;
