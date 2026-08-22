import { z } from "zod";

export const createHoldSchema = z.object({
  departureId: z.uuid(),
  partySize: z.number().int().min(1).max(50),
});

const travelerSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  nationality: z.string().trim().length(2),
});

export const checkoutSchema = z.object({
  holdId: z.uuid(),
  payer: z.object({ fullName: z.string().trim().min(2).max(160), email: z.email() }),
  travelers: z.array(travelerSchema).min(1).max(50),
  termsAccepted: z.literal(true),
});
