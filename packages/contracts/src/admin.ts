import { z } from "zod";
import {
  currencySchema,
  facetOptionSchema,
  imageSchema,
  isoDateSchema,
  listPageSchema,
  moneySchema,
  offsetDateTimeSchema,
} from "./common";

export const bookingStatusSchema = z.enum(["HELD", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]);
export const paymentStatusSchema = z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "FAILED", "REFUNDED"]);
export const departureStatusSchema = z.enum(["DRAFT", "OPEN", "GUARANTEED", "SOLD_OUT", "CANCELLED", "COMPLETED"]);
export const readinessLevelSchema = z.enum(["READY", "WARNING", "CRITICAL"]);
export const documentStatusSchema = z.enum(["READY", "MISSING", "PENDING", "EXPIRING", "EXPIRED", "REJECTED"]);
export const reconciliationStatusSchema = z.enum(["MATCHED", "UNMATCHED", "PENDING", "EXCEPTION"]);

const changeMetricSchema = z.object({
  count: z.number().int().min(0),
  changePercent: z.number().finite(),
}).strict();

export const dashboardDepartureSchema = z.object({
  id: z.string().min(1),
  tour: z.object({ id: z.string().min(1), name: z.string().min(1), heroImageUrl: z.string().min(1) }).strict(),
  startsOn: isoDateSchema,
  endsOn: isoDateSchema,
  status: departureStatusSchema,
  capacity: z.object({ confirmed: z.number().int().min(0), total: z.number().int().positive(), percent: z.number().min(0).max(100) }).strict(),
  readiness: z.object({ paymentsPercent: z.number().min(0).max(100), documentsPercent: z.number().min(0).max(100), operationsPercent: z.number().min(0).max(100) }).strict(),
  riskCount: z.number().int().min(0),
}).strict();

export const adminBookingListItemSchema = z.object({
  id: z.string().min(1),
  bookingNumber: z.string().min(1),
  customer: z.object({ id: z.string().min(1), name: z.string().min(1), email: z.email() }).strict(),
  tour: z.object({ id: z.string().min(1), name: z.string().min(1) }).strict(),
  departure: z.object({ id: z.string().min(1), code: z.string().min(1), startsOn: isoDateSchema }).strict(),
  travelers: z.number().int().min(1),
  bookingStatus: bookingStatusSchema,
  paymentStatus: paymentStatusSchema,
  total: moneySchema,
  balance: moneySchema,
  source: z.string().min(1),
  createdAt: offsetDateTimeSchema,
}).strict();

export const adminDashboardResponseSchema = z.object({
  period: z.object({ range: z.enum(["30d", "90d", "12m"]), from: isoDateSchema, to: isoDateSchema, comparisonFrom: isoDateSchema, comparisonTo: isoDateSchema }).strict(),
  metrics: z.object({
    confirmedBookingValue: moneySchema.extend({ changePercent: z.number().finite() }).strict(),
    confirmedBookings: changeMetricSchema,
    upcomingDepartures: z.object({ count: z.number().int().min(0), withinSevenDays: z.number().int().min(0) }).strict(),
    travelersTravelingSoon: z.object({ count: z.number().int().min(0), change: z.number().int() }).strict(),
    outstandingBalance: moneySchema.extend({ bookingCount: z.number().int().min(0) }).strict(),
  }).strict(),
  trend: z.array(z.object({ period: isoDateSchema, bookingValueMinor: z.number().int().min(0), bookingCount: z.number().int().min(0) }).strict()),
  departureHealth: z.object({ averageOccupancyPercent: z.number().min(0).max(100), soldOutCount: z.number().int().min(0), atRiskCount: z.number().int().min(0), fullyReadyCount: z.number().int().min(0) }).strict(),
  risks: z.array(z.object({ id: z.string().min(1), severity: z.enum(["INFO", "WARNING", "CRITICAL"]), type: z.string().min(1), title: z.string().min(1), description: z.string().min(1), departureId: z.string().min(1), href: z.string().startsWith("/") }).strict()),
  upcomingDepartures: z.array(dashboardDepartureSchema),
  recentBookings: z.array(adminBookingListItemSchema),
}).strict();

export const adminTourListItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  heroImage: imageSchema,
  category: z.string().min(1),
  destinations: z.array(z.string().min(1)),
  durationDays: z.number().int().positive(),
  priceFrom: moneySchema,
  activeDepartures: z.number().int().min(0),
  nextDeparture: isoDateSchema.nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  updatedAt: offsetDateTimeSchema,
}).strict();

export const adminDepartureListItemSchema = dashboardDepartureSchema.extend({
  code: z.string().min(1),
  paymentCompletionPercent: z.number().min(0).max(100),
  documentCompletionPercent: z.number().min(0).max(100),
  operationsCompletionPercent: z.number().min(0).max(100),
  outstandingBalanceMinor: z.number().int().min(0),
  currency: currencySchema,
  risk: z.object({ level: readinessLevelSchema, count: z.number().int().min(0) }).strict(),
}).omit({ readiness: true, riskCount: true }).strict();

export const adminCustomerListItemSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), email: z.email(), segment: z.string().min(1), source: z.string().min(1), bookingCount: z.number().int().min(0), lifetimeValue: moneySchema, nextTrip: isoDateSchema.nullable(), latestActivityAt: offsetDateTimeSchema,
}).strict();

export const adminTravelerListItemSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), email: z.email().nullable(), nationality: z.string().length(2), trip: z.object({ bookingId: z.string().min(1), tourName: z.string().min(1), startsOn: isoDateSchema }).strict(), documentReadinessPercent: z.number().min(0).max(100), visaStatus: z.string().min(1), requirementFlags: z.array(z.string()),
}).strict();

export const adminDocumentListItemSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), type: z.string().min(1), travelerName: z.string().min(1), bookingNumber: z.string().min(1), departureCode: z.string().min(1), status: documentStatusSchema, visibility: z.enum(["STAFF", "TRAVELER", "BOTH"]), expiresOn: isoDateSchema.nullable(), updatedAt: offsetDateTimeSchema,
}).strict();

export const adminPaymentListItemSchema = z.object({
  id: z.string().min(1), reference: z.string().min(1), bookingNumber: z.string().min(1), customerName: z.string().min(1), provider: z.string().min(1), amount: moneySchema, status: z.enum(["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"]), reconciliationStatus: reconciliationStatusSchema, createdAt: offsetDateTimeSchema,
}).strict();

export const adminInvoiceListItemSchema = z.object({
  id: z.string().min(1), invoiceNumber: z.string().min(1), bookingNumber: z.string().min(1), customerName: z.string().min(1), total: moneySchema, paid: moneySchema, outstanding: moneySchema, status: z.enum(["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"]), issuedOn: isoDateSchema, dueOn: isoDateSchema,
}).strict();

export const adminPromotionListItemSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), code: z.string().min(1), benefit: z.string().min(1), scope: z.string().min(1), status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "EXPIRED", "PAUSED"]), redemptions: z.number().int().min(0), startsOn: isoDateSchema, endsOn: isoDateSchema.nullable(),
}).strict();

export const adminConversationListItemSchema = z.object({
  id: z.string().min(1), subject: z.string().min(1), channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "PORTAL"]), status: z.enum(["OPEN", "PENDING", "RESOLVED"]), customer: z.object({ id: z.string().min(1), name: z.string().min(1) }).strict(), bookingNumber: z.string().nullable(), preview: z.string().min(1), unreadCount: z.number().int().min(0), updatedAt: offsetDateTimeSchema,
}).strict();

function paged<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), page: listPageSchema, summary: z.record(z.string(), z.unknown()).optional(), facets: z.record(z.string(), z.array(facetOptionSchema)).optional() }).strict();
}

export const adminBookingsResponseSchema = paged(adminBookingListItemSchema);
export const adminToursResponseSchema = paged(adminTourListItemSchema);
export const adminDeparturesResponseSchema = paged(adminDepartureListItemSchema);
export const adminCustomersResponseSchema = paged(adminCustomerListItemSchema);
export const adminTravelersResponseSchema = paged(adminTravelerListItemSchema);
export const adminDocumentsResponseSchema = paged(adminDocumentListItemSchema);
export const adminPaymentsResponseSchema = paged(adminPaymentListItemSchema);
export const adminInvoicesResponseSchema = paged(adminInvoiceListItemSchema);
export const adminPromotionsResponseSchema = paged(adminPromotionListItemSchema);
export const adminConversationsResponseSchema = paged(adminConversationListItemSchema);

export type AdminDashboardResponse = z.infer<typeof adminDashboardResponseSchema>;
export type AdminBookingListItem = z.infer<typeof adminBookingListItemSchema>;
export type AdminTourListItem = z.infer<typeof adminTourListItemSchema>;
export type AdminDepartureListItem = z.infer<typeof adminDepartureListItemSchema>;

