import { z } from "zod";
import { currencySchema, imageSchema, isoDateSchema, linkSchema, listPageSchema, moneySchema } from "./common";
import { departureStatusSchema } from "./admin";

export const storefrontBootstrapResponseSchema = z.object({
  tenant: z.object({ id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1) }).strict(),
  brand: z.object({ logoUrl: z.string().min(1).optional(), wordmark: z.string().min(1), theme: z.object({ primary: z.string().min(1), accent: z.string().min(1), surface: z.string().min(1) }).strict() }).strict(),
  navigation: z.array(linkSchema),
  footer: z.object({ description: z.string().min(1), groups: z.array(z.object({ label: z.string().min(1), links: z.array(linkSchema) }).strict()) }).strict(),
  locale: z.enum(["mn", "en"]),
  currency: currencySchema,
}).strict();

export const storefrontTourSummarySchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1), summary: z.string().min(1), heroImage: imageSchema, category: z.string().min(1), destinations: z.array(z.string().min(1)), durationDays: z.number().int().positive(), priceFrom: moneySchema, nextAvailableOn: isoDateSchema.nullable(), availabilityLabel: z.enum(["AVAILABLE", "LIMITED", "SOLD_OUT"]), promotion: z.object({ code: z.string().min(1), label: z.string().min(1) }).strict().nullable(),
}).strict();

export const storefrontDestinationSchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1), region: z.string().min(1), summary: z.string().min(1), image: imageSchema, tourCount: z.number().int().min(0), featured: z.boolean(),
}).strict();

export const storefrontHomeResponseSchema = z.object({
  hero: z.object({ eyebrow: z.string().min(1), title: z.string().min(1), description: z.string().min(1), image: imageSchema, primaryAction: linkSchema }).strict(),
  search: z.object({ destinations: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) }).strict()), months: z.array(z.object({ value: z.string().regex(/^\d{4}-\d{2}$/), label: z.string().min(1) }).strict()) }).strict(),
  featuredTours: z.array(storefrontTourSummarySchema),
  featuredDestinations: z.array(storefrontDestinationSchema),
  promotion: z.object({ title: z.string().min(1), description: z.string().min(1), href: z.string().startsWith("/"), image: imageSchema }).strict().nullable(),
  editorial: z.array(z.object({ id: z.string().min(1), eyebrow: z.string().min(1), title: z.string().min(1), body: z.string().min(1), image: imageSchema, href: z.string().startsWith("/").optional() }).strict()),
  trustItems: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), description: z.string().min(1) }).strict()),
}).strict();

export const storefrontDepartureSummarySchema = z.object({
  id: z.string().min(1), startsOn: isoDateSchema, endsOn: isoDateSchema, status: departureStatusSchema, availability: z.object({ remaining: z.number().int().min(0), capacity: z.number().int().positive(), label: z.enum(["AVAILABLE", "LIMITED", "SOLD_OUT"]), percent: z.number().min(0).max(100) }).strict(), price: moneySchema, bookingDeadline: isoDateSchema,
}).strict();

export const storefrontTourDetailResponseSchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), status: z.enum(["PUBLISHED"]),
  hero: z.object({ title: z.string().min(1), eyebrow: z.string().min(1), summary: z.string().min(1), image: imageSchema }).strict(),
  facts: z.object({ durationDays: z.number().int().positive(), durationNights: z.number().int().min(0), difficulty: z.string().min(1), groupSize: z.object({ min: z.number().int().positive(), max: z.number().int().positive() }).strict(), destinations: z.array(z.string().min(1)) }).strict(),
  priceFrom: moneySchema,
  highlights: z.array(z.string().min(1)),
  story: z.array(z.object({ type: z.enum(["TEXT", "IMAGE_TEXT", "QUOTE"]), title: z.string().min(1), body: z.string().min(1), image: imageSchema.optional() }).strict()),
  itinerary: z.array(z.object({ day: z.number().int().positive(), title: z.string().min(1), description: z.string().min(1), imageUrl: z.string().min(1).optional() }).strict()),
  gallery: z.array(imageSchema),
  included: z.array(z.string().min(1)), excluded: z.array(z.string().min(1)),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) }).strict()),
  departures: z.array(storefrontDepartureSummarySchema),
}).strict();

export const storefrontToursResponseSchema = z.object({
  items: z.array(storefrontTourSummarySchema), page: listPageSchema,
  facets: z.object({ destinations: z.array(z.object({ value: z.string(), label: z.string(), count: z.number().int().min(0) }).strict()), categories: z.array(z.object({ value: z.string(), label: z.string(), count: z.number().int().min(0) }).strict()), months: z.array(z.object({ value: z.string(), label: z.string(), count: z.number().int().min(0) }).strict()) }).strict(),
  sortOptions: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) }).strict()),
}).strict();

export const storefrontDestinationsResponseSchema = z.object({ items: z.array(storefrontDestinationSchema), page: listPageSchema, regions: z.array(z.string().min(1)) }).strict();

export const storefrontDepartureResponseSchema = z.object({
  id: z.string().min(1), code: z.string().min(1), tour: storefrontTourSummarySchema, startsOn: isoDateSchema, endsOn: isoDateSchema, status: departureStatusSchema, availability: storefrontDepartureSummarySchema.shape.availability, price: moneySchema, bookingDeadline: isoDateSchema, itineraryPreview: z.array(z.object({ day: z.number().int().positive(), title: z.string().min(1) }).strict()), inclusions: z.array(z.string().min(1)),
}).strict();

export const storefrontCheckoutContextSchema = z.object({
  holdPolicy: z.object({ durationMinutes: z.number().int().positive() }).strict(),
  tour: z.object({ slug: z.string().min(1), name: z.string().min(1), heroImageUrl: z.string().min(1) }).strict(),
  departure: z.object({ id: z.string().min(1), startsOn: isoDateSchema, endsOn: isoDateSchema, remainingCapacity: z.number().int().min(0) }).strict(),
  pricing: z.object({ currency: currencySchema, perTravelerMinor: z.number().int().min(0), feesMinor: z.number().int().min(0), eligiblePromotions: z.array(z.object({ code: z.string(), label: z.string(), discountMinor: z.number().int().min(0) }).strict()) }).strict(),
  requirements: z.object({ travelerFields: z.array(z.enum(["fullName", "nationality", "dateOfBirth", "dietaryRequirements", "specialRequirements"])) }).strict(),
  paymentMethods: z.array(z.enum(["QPAY", "STRIPE", "DEMO"])),
}).strict();

export type StorefrontBootstrapResponse = z.infer<typeof storefrontBootstrapResponseSchema>;
export type StorefrontHomeResponse = z.infer<typeof storefrontHomeResponseSchema>;
export type StorefrontTourSummary = z.infer<typeof storefrontTourSummarySchema>;
export type StorefrontTourDetailResponse = z.infer<typeof storefrontTourDetailResponseSchema>;
export type StorefrontDepartureResponse = z.infer<typeof storefrontDepartureResponseSchema>;
export type StorefrontCheckoutContext = z.infer<typeof storefrontCheckoutContextSchema>;
export type StorefrontToursResponse = z.infer<typeof storefrontToursResponseSchema>;
export type StorefrontDestinationsResponse = z.infer<typeof storefrontDestinationsResponseSchema>;
