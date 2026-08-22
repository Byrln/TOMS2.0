import { z } from "zod";

export const createDepartureSchema = z.object({
  tourId: z.uuid(),
  code: z.string().trim().min(3).max(60),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  capacity: z.number().int().min(1).max(500),
  priceMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  currency: z.string().regex(/^[A-Z]{3}$/),
}).refine((value) => value.endsOn >= value.startsOn, { path: ["endsOn"], message: "End date must not precede start date" });
