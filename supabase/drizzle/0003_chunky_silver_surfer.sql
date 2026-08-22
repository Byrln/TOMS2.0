ALTER TABLE "booking_parties" ALTER COLUMN "is_organizer" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "booking_parties" ALTER COLUMN "is_organizer" SET DATA TYPE boolean USING "is_organizer"::boolean;--> statement-breakpoint
ALTER TABLE "booking_parties" ALTER COLUMN "is_organizer" SET DEFAULT false;
