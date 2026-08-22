CREATE TYPE "public"."booking_status" AS ENUM('DRAFT', 'ON_HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."departure_status" AS ENUM('DRAFT', 'OPEN', 'GUARANTEED', 'SOLD_OUT', 'CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('VOUCHER', 'INVOICE', 'RECEIPT', 'HOTEL_CONFIRMATION', 'TRANSFER_CONFIRMATION', 'FLIGHT_INFORMATION', 'TRAVELER_DOCUMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."document_visibility" AS ENUM('PUBLIC', 'TRAVELER', 'STAFF', 'SUPPLIER');--> statement-breakpoint
CREATE TYPE "public"."inventory_hold_status" AS ENUM('ACTIVE', 'CONSUMED', 'EXPIRED', 'RELEASED');--> statement-breakpoint
CREATE TYPE "public"."itinerary_visibility" AS ENUM('PUBLIC', 'BOOKED_TRAVELER', 'BOOKING_ORGANIZER', 'INTERNAL_STAFF', 'SUPPLIER');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('mn', 'en');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."payment_attempt_status" AS ENUM('PENDING', 'AUTHORIZED', 'SUCCEEDED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."promotion_presentation" AS ENUM('COUPON', 'BANNER', 'SPIN_WHEEL', 'MEMBER_PRICE', 'EARLY_BIRD', 'LAST_MINUTE', 'REFERRAL');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('UNMATCHED', 'MATCHED', 'DIFFERENCE', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."release_status" AS ENUM('DRAFT', 'VALIDATING', 'PUBLISHED', 'SUPERSEDED');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('OWNER', 'ADMIN', 'SALES', 'OPERATIONS', 'FINANCE', 'CONTENT', 'GUIDE', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."supplier_confirmation_status" AS ENUM('NOT_REQUESTED', 'REQUESTED', 'WAITING', 'CONFIRMED', 'CHANGED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."tour_status" AS ENUM('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('UPCOMING', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"request_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "booking_parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"traveler_profile_id" uuid NOT NULL,
	"auth_user_id" uuid,
	"traveler_snapshot" jsonb NOT NULL,
	"is_organizer" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_parties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_number" text NOT NULL,
	"tour_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"hold_id" uuid,
	"customer_account_id" uuid,
	"organizer_person_id" uuid,
	"payer_person_id" uuid,
	"organizer_email" text NOT NULL,
	"party_size" integer NOT NULL,
	"status" "booking_status" DEFAULT 'DRAFT' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'UNPAID' NOT NULL,
	"total_minor" bigint NOT NULL,
	"currency" text NOT NULL,
	"source" text DEFAULT 'STOREFRONT' NOT NULL,
	"tour_snapshot" jsonb NOT NULL,
	"price_snapshot" jsonb NOT NULL,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cms_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"type" text NOT NULL,
	"sort_order" integer NOT NULL,
	"content_i18n" jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cms_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cms_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"storefront_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title_i18n" jsonb NOT NULL,
	"seo_i18n" jsonb NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cms_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tour_id" uuid NOT NULL,
	"code" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"capacity" integer NOT NULL,
	"confirmed_count" integer DEFAULT 0 NOT NULL,
	"held_count" integer DEFAULT 0 NOT NULL,
	"status" "departure_status" DEFAULT 'DRAFT' NOT NULL,
	"trip_status" "trip_status" DEFAULT 'UPCOMING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departures" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_id" uuid,
	"departure_id" uuid,
	"traveler_profile_id" uuid,
	"type" "document_type" NOT NULL,
	"title_i18n" jsonb NOT NULL,
	"visibility" "document_visibility" DEFAULT 'STAFF' NOT NULL,
	"bucket" text NOT NULL,
	"object_path" text NOT NULL,
	"content_type" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"total_minor" bigint NOT NULL,
	"paid_minor" bigint DEFAULT 0 NOT NULL,
	"currency" text NOT NULL,
	"issued_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "payment_attempt_status" DEFAULT 'PENDING' NOT NULL,
	"provider_reference" text,
	"response" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"provider" text NOT NULL,
	"provider_event_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"invoice_id" uuid,
	"provider" text NOT NULL,
	"provider_transaction_id" text,
	"status" "payment_status" DEFAULT 'UNPAID' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" text NOT NULL,
	"settlement_amount_minor" bigint,
	"settlement_currency" text,
	"reconciliation_status" "reconciliation_status" DEFAULT 'UNMATCHED' NOT NULL,
	"succeeded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"reason" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" text NOT NULL,
	"internal_status" text DEFAULT 'REQUESTED' NOT NULL,
	"provider_status" text DEFAULT 'NOT_SUBMITTED' NOT NULL,
	"requested_by" uuid NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"operation" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"request_hash" text NOT NULL,
	"result" jsonb,
	"resource_type" text,
	"resource_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idempotency_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid,
	"organization_id" uuid,
	"segment" text DEFAULT 'STANDARD' NOT NULL,
	"open_balance_minor" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_name" text NOT NULL,
	"registration_number" text,
	"tax_number" text,
	"email" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"auth_user_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"nationality" text,
	"preferred_locale" text DEFAULT 'mn' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "people" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "traveler_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"passport_country" text,
	"passport_last_four" text,
	"document_readiness" text DEFAULT 'MISSING' NOT NULL,
	"visa_status" text,
	"dietary_requirements" text,
	"allergies" text,
	"accessibility" text,
	"seat_preference" text,
	"room_preference" text,
	"emergency_contacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "traveler_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "inventory_holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"quantity" integer NOT NULL,
	"status" "inventory_hold_status" DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_holds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "itinerary_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"title_i18n" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itinerary_days" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "itinerary_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"itinerary_day_id" uuid,
	"day_number" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"type" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"title_i18n" jsonb NOT NULL,
	"details_i18n" jsonb NOT NULL,
	"location_i18n" jsonb NOT NULL,
	"visibility" "itinerary_visibility" DEFAULT 'BOOKED_TRAVELER' NOT NULL,
	"supplier_id" uuid,
	"service_order_id" uuid,
	"internal_notes" text,
	"version" integer DEFAULT 1 NOT NULL,
	"change_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itinerary_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "loyalty_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_account_id" uuid NOT NULL,
	"booking_id" uuid,
	"kind" text NOT NULL,
	"points" bigint NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "loyalty_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_account_id" uuid,
	"booking_id" uuid,
	"departure_id" uuid,
	"subject" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"channel" text DEFAULT 'EMAIL' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_user_id" uuid,
	"sender_person_id" uuid,
	"body" text NOT NULL,
	"is_internal" text DEFAULT 'false' NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "departure_readiness" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"area" text NOT NULL,
	"completion_percent" integer DEFAULT 0 NOT NULL,
	"label" text NOT NULL,
	"blocking_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departure_readiness" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "operation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"departure_id" uuid,
	"booking_id" uuid,
	"title" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"assignee_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operation_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"deduplication_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"last_error" text
);
--> statement-breakpoint
ALTER TABLE "outbox_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "fx_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"base_currency" text NOT NULL,
	"quote_currency" text NOT NULL,
	"rate" text NOT NULL,
	"source" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fx_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tour_id" uuid NOT NULL,
	"departure_id" uuid,
	"price_type" text DEFAULT 'ADULT' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" text NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tour_prices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "promotion_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"promotion_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"customer_account_id" uuid,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promotion_redemptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name_i18n" jsonb NOT NULL,
	"description_i18n" jsonb NOT NULL,
	"conditions" jsonb NOT NULL,
	"benefit" jsonb NOT NULL,
	"presentation" "promotion_presentation" DEFAULT 'COUPON' NOT NULL,
	"redemption_limit" integer,
	"per_customer_limit" integer DEFAULT 1 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promotions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storefront_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"storefront_id" uuid NOT NULL,
	"version" text NOT NULL,
	"status" "release_status" DEFAULT 'DRAFT' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"checksum" text NOT NULL,
	"published_by" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storefront_releases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "storefronts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"brand_name_i18n" jsonb NOT NULL,
	"template" text DEFAULT 'HIMALAYA' NOT NULL,
	"theme_tokens" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"navigation_i18n" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "release_status" DEFAULT 'DRAFT' NOT NULL,
	"active_release_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storefronts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "service_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reference" text,
	"title_i18n" jsonb NOT NULL,
	"confirmation_status" "supplier_confirmation_status" DEFAULT 'NOT_REQUESTED' NOT NULL,
	"supplier_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"email" text,
	"phone" text,
	"currencies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenant_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"host" text NOT NULL,
	"is_primary" text DEFAULT 'false' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_domains" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "staff_role" NOT NULL,
	"status" "membership_status" DEFAULT 'ACTIVE' NOT NULL,
	"invited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_i18n" jsonb NOT NULL,
	"default_locale" "locale" DEFAULT 'mn' NOT NULL,
	"supported_locales" jsonb DEFAULT '["mn","en"]'::jsonb NOT NULL,
	"default_currency" text DEFAULT 'MNT' NOT NULL,
	"time_zone" text DEFAULT 'Asia/Ulaanbaatar' NOT NULL,
	"status" "tenant_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tour_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name_i18n" jsonb NOT NULL,
	"summary_i18n" jsonb NOT NULL,
	"description_i18n" jsonb NOT NULL,
	"category" text NOT NULL,
	"duration_days" integer NOT NULL,
	"duration_nights" integer NOT NULL,
	"difficulty" text DEFAULT 'MODERATE' NOT NULL,
	"destinations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '["mn","en"]'::jsonb NOT NULL,
	"highlights_i18n" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"inclusions_i18n" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exclusions_i18n" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hero_image_path" text,
	"status" "tour_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" text,
	"archived_at" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tour_definitions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_parties" ADD CONSTRAINT "booking_parties_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_parties" ADD CONSTRAINT "booking_parties_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_parties" ADD CONSTRAINT "booking_parties_traveler_profile_id_traveler_profiles_id_fk" FOREIGN KEY ("traveler_profile_id") REFERENCES "public"."traveler_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tour_definitions_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tour_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hold_id_inventory_holds_id_fk" FOREIGN KEY ("hold_id") REFERENCES "public"."inventory_holds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_account_id_customer_accounts_id_fk" FOREIGN KEY ("customer_account_id") REFERENCES "public"."customer_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organizer_person_id_people_id_fk" FOREIGN KEY ("organizer_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_payer_person_id_people_id_fk" FOREIGN KEY ("payer_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_blocks" ADD CONSTRAINT "cms_blocks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_blocks" ADD CONSTRAINT "cms_blocks_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_storefront_id_storefronts_id_fk" FOREIGN KEY ("storefront_id") REFERENCES "public"."storefronts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_tour_id_tour_definitions_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tour_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_accounts" ADD CONSTRAINT "customer_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_accounts" ADD CONSTRAINT "customer_accounts_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_accounts" ADD CONSTRAINT "customer_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traveler_profiles" ADD CONSTRAINT "traveler_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traveler_profiles" ADD CONSTRAINT "traveler_profiles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_holds" ADD CONSTRAINT "inventory_holds_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_holds" ADD CONSTRAINT "inventory_holds_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_events" ADD CONSTRAINT "itinerary_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_events" ADD CONSTRAINT "itinerary_events_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_events" ADD CONSTRAINT "itinerary_events_itinerary_day_id_itinerary_days_id_fk" FOREIGN KEY ("itinerary_day_id") REFERENCES "public"."itinerary_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_entries" ADD CONSTRAINT "loyalty_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departure_readiness" ADD CONSTRAINT "departure_readiness_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departure_readiness" ADD CONSTRAINT "departure_readiness_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operation_tasks" ADD CONSTRAINT "operation_tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operation_tasks" ADD CONSTRAINT "operation_tasks_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_snapshots" ADD CONSTRAINT "fx_snapshots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_prices" ADD CONSTRAINT "tour_prices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_prices" ADD CONSTRAINT "tour_prices_tour_id_tour_definitions_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tour_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_prices" ADD CONSTRAINT "tour_prices_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_releases" ADD CONSTRAINT "storefront_releases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_releases" ADD CONSTRAINT "storefront_releases_storefront_id_storefronts_id_fk" FOREIGN KEY ("storefront_id") REFERENCES "public"."storefronts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefronts" ADD CONSTRAINT "storefronts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD CONSTRAINT "tenant_domains_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_definitions" ADD CONSTRAINT "tour_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("tenant_id","entity_type","entity_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_parties_booking_traveler_uidx" ON "booking_parties" USING btree ("booking_id","traveler_profile_id");--> statement-breakpoint
CREATE INDEX "booking_parties_auth_user_idx" ON "booking_parties" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_tenant_number_uidx" ON "bookings" USING btree ("tenant_id","booking_number");--> statement-breakpoint
CREATE INDEX "bookings_tenant_departure_status_idx" ON "bookings" USING btree ("tenant_id","departure_id","status");--> statement-breakpoint
CREATE INDEX "bookings_tenant_payment_status_idx" ON "bookings" USING btree ("tenant_id","payment_status");--> statement-breakpoint
CREATE INDEX "cms_blocks_page_order_idx" ON "cms_blocks" USING btree ("page_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_pages_storefront_slug_uidx" ON "cms_pages" USING btree ("storefront_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "departures_tenant_code_uidx" ON "departures" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "departures_tenant_tour_date_idx" ON "departures" USING btree ("tenant_id","tour_id","starts_on");--> statement-breakpoint
CREATE INDEX "departures_tenant_status_date_idx" ON "departures" USING btree ("tenant_id","status","starts_on");--> statement-breakpoint
CREATE INDEX "documents_booking_idx" ON "documents" USING btree ("tenant_id","booking_id");--> statement-breakpoint
CREATE INDEX "documents_departure_idx" ON "documents" USING btree ("tenant_id","departure_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_tenant_number_uidx" ON "invoices" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_booking_idx" ON "invoices" USING btree ("tenant_id","booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_attempts_tenant_key_uidx" ON "payment_attempts" USING btree ("tenant_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_provider_event_uidx" ON "payment_webhook_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_transaction_uidx" ON "payments" USING btree ("provider","provider_transaction_id");--> statement-breakpoint
CREATE INDEX "payments_tenant_status_idx" ON "payments" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_tenant_key_uidx" ON "refunds" USING btree ("tenant_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_operation_uidx" ON "idempotency_keys" USING btree ("tenant_id","operation","idempotency_key");--> statement-breakpoint
CREATE INDEX "idempotency_keys_expiry_idx" ON "idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "customer_accounts_tenant_idx" ON "customer_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "organizations_tenant_name_idx" ON "organizations" USING btree ("tenant_id","legal_name");--> statement-breakpoint
CREATE INDEX "people_tenant_name_idx" ON "people" USING btree ("tenant_id","last_name");--> statement-breakpoint
CREATE UNIQUE INDEX "people_tenant_auth_user_uidx" ON "people" USING btree ("tenant_id","auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "traveler_profiles_tenant_person_uidx" ON "traveler_profiles" USING btree ("tenant_id","person_id");--> statement-breakpoint
CREATE INDEX "traveler_profiles_tenant_readiness_idx" ON "traveler_profiles" USING btree ("tenant_id","document_readiness");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_holds_tenant_idempotency_uidx" ON "inventory_holds" USING btree ("tenant_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "inventory_holds_active_idx" ON "inventory_holds" USING btree ("tenant_id","departure_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "itinerary_days_departure_idx" ON "itinerary_days" USING btree ("tenant_id","departure_id","day_number");--> statement-breakpoint
CREATE INDEX "itinerary_events_departure_day_idx" ON "itinerary_events" USING btree ("tenant_id","departure_id","day_number","sort_order");--> statement-breakpoint
CREATE INDEX "loyalty_customer_idx" ON "loyalty_entries" USING btree ("tenant_id","customer_account_id","created_at");--> statement-breakpoint
CREATE INDEX "conversations_queue_idx" ON "conversations" USING btree ("tenant_id","status","updated_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("tenant_id","conversation_id","sent_at");--> statement-breakpoint
CREATE INDEX "departure_readiness_lookup_idx" ON "departure_readiness" USING btree ("tenant_id","departure_id","area");--> statement-breakpoint
CREATE INDEX "operation_tasks_queue_idx" ON "operation_tasks" USING btree ("tenant_id","status","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_events_dedupe_uidx" ON "outbox_events" USING btree ("tenant_id","deduplication_key");--> statement-breakpoint
CREATE INDEX "outbox_events_pending_idx" ON "outbox_events" USING btree ("processed_at","available_at");--> statement-breakpoint
CREATE INDEX "tour_prices_lookup_idx" ON "tour_prices" USING btree ("tenant_id","tour_id","departure_id");--> statement-breakpoint
CREATE INDEX "promotion_redemptions_limit_idx" ON "promotion_redemptions" USING btree ("tenant_id","promotion_id","customer_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "promotions_tenant_code_uidx" ON "promotions" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "promotions_active_idx" ON "promotions" USING btree ("tenant_id","status","starts_at","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "storefront_releases_storefront_version_uidx" ON "storefront_releases" USING btree ("storefront_id","version");--> statement-breakpoint
CREATE INDEX "storefront_releases_published_idx" ON "storefront_releases" USING btree ("tenant_id","status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "storefronts_tenant_slug_uidx" ON "storefronts" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "service_orders_departure_idx" ON "service_orders" USING btree ("tenant_id","departure_id","confirmation_status");--> statement-breakpoint
CREATE INDEX "suppliers_tenant_name_idx" ON "suppliers" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_domains_host_uidx" ON "tenant_domains" USING btree ("host");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_memberships_tenant_user_uidx" ON "tenant_memberships" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "tenant_memberships_user_idx" ON "tenant_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_uidx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_definitions_tenant_slug_uidx" ON "tour_definitions" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "tour_definitions_tenant_status_idx" ON "tour_definitions" USING btree ("tenant_id","status");