import { z } from "zod";

export const localizedTextSchema = z.object({ mn: z.string().min(1), en: z.string().min(1) });

export const tourListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sort: z.string().regex(/^-?(name|status|createdAt|durationDays)$/).optional(),
  q: z.string().trim().max(100).optional(),
  locale: z.enum(["mn", "en"]).optional(),
});

export const createTourInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: localizedTextSchema,
  summary: localizedTextSchema,
  description: localizedTextSchema,
  category: z.string().min(2),
  durationDays: z.number().int().positive(),
  durationNights: z.number().int().nonnegative(),
  destinations: z.array(z.string().min(2)).min(1),
  languages: z.array(z.enum(["mn", "en"])).min(1),
  basePriceMinor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
