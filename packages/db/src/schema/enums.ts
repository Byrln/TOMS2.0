import { pgEnum } from "drizzle-orm/pg-core";

export const localeEnum = pgEnum("locale", ["mn", "en"]);
export const tenantStatusEnum = pgEnum("tenant_status", ["ACTIVE", "SUSPENDED"]);
export const staffRoleEnum = pgEnum("staff_role", ["OWNER", "ADMIN", "SALES", "OPERATIONS", "FINANCE", "CONTENT", "GUIDE", "VIEWER"]);
export const membershipStatusEnum = pgEnum("membership_status", ["INVITED", "ACTIVE", "SUSPENDED"]);
export const tourStatusEnum = pgEnum("tour_status", ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]);
export const departureStatusEnum = pgEnum("departure_status", ["DRAFT", "OPEN", "GUARANTEED", "SOLD_OUT", "CLOSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const tripStatusEnum = pgEnum("trip_status", ["UPCOMING", "IN_PROGRESS", "COMPLETED"]);
export const itineraryVisibilityEnum = pgEnum("itinerary_visibility", ["PUBLIC", "BOOKED_TRAVELER", "BOOKING_ORGANIZER", "INTERNAL_STAFF", "SUPPLIER"]);
export const inventoryHoldStatusEnum = pgEnum("inventory_hold_status", ["ACTIVE", "CONSUMED", "EXPIRED", "RELEASED"]);
export const bookingStatusEnum = pgEnum("booking_status", ["DRAFT", "ON_HOLD", "CONFIRMED", "CANCELLED", "EXPIRED"]);
export const paymentStatusEnum = pgEnum("payment_status", ["UNPAID", "PARTIALLY_PAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "FAILED"]);
export const paymentAttemptStatusEnum = pgEnum("payment_attempt_status", ["PENDING", "AUTHORIZED", "SUCCEEDED", "FAILED", "CANCELLED"]);
export const supplierConfirmationStatusEnum = pgEnum("supplier_confirmation_status", ["NOT_REQUESTED", "REQUESTED", "WAITING", "CONFIRMED", "CHANGED", "CANCELLED"]);
export const documentVisibilityEnum = pgEnum("document_visibility", ["PUBLIC", "TRAVELER", "STAFF", "SUPPLIER"]);
export const documentTypeEnum = pgEnum("document_type", ["VOUCHER", "INVOICE", "RECEIPT", "HOTEL_CONFIRMATION", "TRANSFER_CONFIRMATION", "FLIGHT_INFORMATION", "TRAVELER_DOCUMENT", "OTHER"]);
export const releaseStatusEnum = pgEnum("release_status", ["DRAFT", "VALIDATING", "PUBLISHED", "SUPERSEDED"]);
export const promotionPresentationEnum = pgEnum("promotion_presentation", ["COUPON", "BANNER", "SPIN_WHEEL", "MEMBER_PRICE", "EARLY_BIRD", "LAST_MINUTE", "REFERRAL"]);
export const reconciliationStatusEnum = pgEnum("reconciliation_status", ["UNMATCHED", "MATCHED", "DIFFERENCE", "RESOLVED"]);

export const statuses = {
  booking: bookingStatusEnum.enumValues,
  payment: paymentStatusEnum.enumValues,
  trip: tripStatusEnum.enumValues,
  departure: departureStatusEnum.enumValues,
  supplierConfirmation: supplierConfirmationStatusEnum.enumValues,
} as const;
