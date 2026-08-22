import { z } from "zod";

export const currencySchema = z.string().regex(/^[A-Z]{3}$/);
export const isoDateSchema = z.iso.date();
export const offsetDateTimeSchema = z.iso.datetime({ offset: true });

export const moneySchema = z.object({
  amountMinor: z.number().int().safe(),
  currency: currencySchema,
}).strict();

export const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().trim().min(1).max(240),
}).strict();

export const linkSchema = z.object({
  label: z.string().trim().min(1).max(120),
  href: z.string().startsWith("/"),
}).strict();

export const listPageSchema = z.object({
  cursor: z.string().min(1).optional(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  pageCount: z.number().int().min(0),
}).strict();

export const collectionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().max(160).optional(),
  sort: z.string().trim().max(64).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().trim().max(64).optional(),
  paymentStatus: z.string().trim().max(64).optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
}).strict();

export const facetOptionSchema = z.object({
  value: z.string(),
  count: z.number().int().min(0),
}).strict();

export function listResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: listPageSchema,
    summary: z.record(z.string(), z.unknown()).optional(),
    facets: z.record(z.string(), z.array(facetOptionSchema)).optional(),
  }).strict();
}

export type Money = z.infer<typeof moneySchema>;
export type ListPage = z.infer<typeof listPageSchema>;
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;

