import { and, asc, count, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { departures, tourDefinitions, tourPrices, type LocalizedText, type TomsTransaction } from "@toms/db";
import type { PageQuery } from "../../services";

const sortableColumns = {
  status: tourDefinitions.status,
  createdAt: tourDefinitions.createdAt,
  durationDays: tourDefinitions.durationDays,
  name: sql`${tourDefinitions.nameI18n}->>'mn'`,
} as const;

export async function listTours(tx: TomsTransaction, tenantId: string, query: PageQuery) {
  const where = and(
    eq(tourDefinitions.tenantId, tenantId),
    query.q ? ilike(sql`${tourDefinitions.nameI18n}::text`, `%${query.q}%`) : undefined,
  );
  const direction = query.sort?.startsWith("-") ? "desc" : "asc";
  const requestedColumn = query.sort?.replace(/^-/, "") as keyof typeof sortableColumns | undefined;
  const selectedColumn: SQL | (typeof tourDefinitions)[keyof typeof tourDefinitions] = requestedColumn && sortableColumns[requestedColumn]
    ? sortableColumns[requestedColumn]
    : tourDefinitions.createdAt;

  const [rows, totals] = await Promise.all([
    tx.select({
      id: tourDefinitions.id,
      slug: tourDefinitions.slug,
      name: tourDefinitions.nameI18n,
      category: tourDefinitions.category,
      durationDays: tourDefinitions.durationDays,
      durationNights: tourDefinitions.durationNights,
      destinations: tourDefinitions.destinations,
      languages: tourDefinitions.languages,
      status: tourDefinitions.status,
      heroImagePath: tourDefinitions.heroImagePath,
      createdAt: tourDefinitions.createdAt,
    }).from(tourDefinitions).where(where)
      .orderBy(direction === "desc" ? desc(selectedColumn) : asc(selectedColumn))
      .limit(query.pageSize).offset((query.page - 1) * query.pageSize),
    tx.select({ total: count() }).from(tourDefinitions).where(where),
  ]);

  const total = totals[0]?.total ?? 0;
  return { data: rows, pagination: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.ceil(total / query.pageSize) } };
}

export interface CreateTourRecord {
  tenantId: string;
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  category: string;
  durationDays: number;
  durationNights: number;
  destinations: string[];
  languages: Array<"mn" | "en">;
  basePriceMinor: number;
  currency: string;
}

export async function insertTour(tx: TomsTransaction, input: CreateTourRecord) {
  const rows = await tx.insert(tourDefinitions).values({
    tenantId: input.tenantId,
    slug: input.slug,
    nameI18n: input.name,
    summaryI18n: input.summary,
    descriptionI18n: input.description,
    category: input.category,
    durationDays: input.durationDays,
    durationNights: input.durationNights,
    destinations: input.destinations,
    languages: input.languages,
  }).returning();
  const created = rows[0]!;
  await tx.insert(tourPrices).values({ tenantId: input.tenantId, tourId: created.id, priceType: "ADULT", amountMinor: BigInt(input.basePriceMinor), currency: input.currency });
  return created;
}

export async function publishTour(tx: TomsTransaction, tenantId: string, tourId: string, publishedAt: Date) {
  const rows = await tx.update(tourDefinitions).set({ status: "PUBLISHED", publishedAt, updatedAt: publishedAt })
    .where(and(eq(tourDefinitions.id, tourId), eq(tourDefinitions.tenantId, tenantId)))
    .returning();
  return rows[0] ?? null;
}

export async function readTour(tx: TomsTransaction, tenantId: string, tourId: string) {
  const rows = await tx.select().from(tourDefinitions).where(and(eq(tourDefinitions.id, tourId), eq(tourDefinitions.tenantId, tenantId))).limit(1);
  const tour = rows[0];
  if (!tour) return null;
  const [prices, departureRows] = await Promise.all([
    tx.select().from(tourPrices).where(and(eq(tourPrices.tenantId, tenantId), eq(tourPrices.tourId, tourId))),
    tx.select().from(departures).where(and(eq(departures.tenantId, tenantId), eq(departures.tourId, tourId))),
  ]);
  return { tour, prices, departures: departureRows };
}
