ALTER TABLE "messages" ALTER COLUMN "is_internal" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "is_internal" SET DATA TYPE boolean USING "is_internal"::boolean;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "is_internal" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "tenant_domains" ALTER COLUMN "is_primary" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tenant_domains" ALTER COLUMN "is_primary" SET DATA TYPE boolean USING "is_primary"::boolean;--> statement-breakpoint
ALTER TABLE "tenant_domains" ALTER COLUMN "is_primary" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "tour_definitions" ALTER COLUMN "published_at" SET DATA TYPE timestamp with time zone USING NULLIF("published_at", '')::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tour_definitions" ALTER COLUMN "archived_at" SET DATA TYPE timestamp with time zone USING NULLIF("archived_at", '')::timestamp with time zone;
