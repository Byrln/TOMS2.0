import { and, desc, eq, inArray } from "drizzle-orm";
import {
  departures,
  promotions,
  storefrontReleases,
  storefronts,
  tenantDomains,
  tenants,
  tourDefinitions,
  tourPrices,
  type TomsTransaction,
} from "@toms/db";

function benefitLabel(benefit: Record<string, unknown>, locale: "mn" | "en") {
  const value = typeof benefit.value === "number" ? benefit.value : Number(benefit.value ?? 0);
  if (benefit.type === "PERCENTAGE") return locale === "mn" ? `${value}% хөнгөлөлт` : `${value}% off`;
  return String(benefit.value ?? "");
}

export async function readPublishedStorefront(tx: TomsTransaction, host: string, locale: "mn" | "en") {
  const domainRows = await tx.select({ tenantId: tenantDomains.tenantId }).from(tenantDomains)
    .where(eq(tenantDomains.host, host)).limit(1);
  const tenantId = domainRows[0]?.tenantId;
  if (!tenantId) return null;

  const [tenantRows, storefrontRows] = await Promise.all([
    tx.select().from(tenants).where(and(eq(tenants.id, tenantId), eq(tenants.status, "ACTIVE"))).limit(1),
    tx.select().from(storefronts).where(and(eq(storefronts.tenantId, tenantId), eq(storefronts.status, "PUBLISHED"))).limit(1),
  ]);
  const tenant = tenantRows[0];
  const storefront = storefrontRows[0];
  if (!tenant || !storefront) return null;

  const [releaseRows, tours, promotionRows] = await Promise.all([
    tx.select().from(storefrontReleases)
      .where(and(eq(storefrontReleases.tenantId, tenantId), eq(storefrontReleases.storefrontId, storefront.id), eq(storefrontReleases.status, "PUBLISHED")))
      .orderBy(desc(storefrontReleases.publishedAt)).limit(1),
    tx.select({
      id: tourDefinitions.id,
      slug: tourDefinitions.slug,
      name: tourDefinitions.nameI18n,
      summary: tourDefinitions.summaryI18n,
      description: tourDefinitions.descriptionI18n,
      category: tourDefinitions.category,
      durationDays: tourDefinitions.durationDays,
      durationNights: tourDefinitions.durationNights,
      destinations: tourDefinitions.destinations,
      highlights: tourDefinitions.highlightsI18n,
      inclusions: tourDefinitions.inclusionsI18n,
      exclusions: tourDefinitions.exclusionsI18n,
      heroImagePath: tourDefinitions.heroImagePath,
      status: tourDefinitions.status,
    }).from(tourDefinitions)
      .where(and(eq(tourDefinitions.tenantId, tenantId), eq(tourDefinitions.status, "PUBLISHED"))).limit(100),
    tx.select().from(promotions).where(and(eq(promotions.tenantId, tenantId), eq(promotions.status, "ACTIVE"))).limit(24),
  ]);

  const tourIds = tours.map((tour) => tour.id);
  const [departureRows, priceRows] = tourIds.length === 0 ? [[], []] : await Promise.all([
    tx.select().from(departures).where(and(
      eq(departures.tenantId, tenantId),
      inArray(departures.tourId, tourIds),
      inArray(departures.status, ["OPEN", "GUARANTEED"]),
    )),
    tx.select().from(tourPrices).where(and(eq(tourPrices.tenantId, tenantId), inArray(tourPrices.tourId, tourIds))),
  ]);

  const featuredTours = tours.map((tour) => {
    const prices = priceRows.filter((price) => price.tourId === tour.id);
    const basePrice = prices.reduce<(typeof prices)[number] | undefined>((lowest, price) => (
      !lowest || price.amountMinor < lowest.amountMinor ? price : lowest
    ), undefined);
    return {
      id: tour.id,
      slug: tour.slug,
      name: tour.name[locale],
      summary: tour.summary[locale],
      description: tour.description[locale],
      category: tour.category,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      destinations: tour.destinations,
      highlights: tour.highlights.map((item) => item[locale]),
      inclusions: tour.inclusions.map((item) => item[locale]),
      exclusions: tour.exclusions.map((item) => item[locale]),
      heroImageUrl: tour.heroImagePath ?? "/images/altai.png",
      status: tour.status,
      basePriceMinor: Number(basePrice?.amountMinor ?? 0n),
      currency: basePrice?.currency ?? tenant.defaultCurrency,
      departures: departureRows.filter((departure) => departure.tourId === tour.id).map((departure) => {
        const price = prices.find((item) => item.departureId === departure.id) ?? basePrice;
        return { ...departure, priceMinor: Number(price?.amountMinor ?? 0n), currency: price?.currency ?? tenant.defaultCurrency };
      }),
    };
  });

  return {
    locale,
    tenant: { id: tenant.id, name: tenant.nameI18n[locale], slug: tenant.slug },
    storefront: {
      id: storefront.id,
      name: storefront.brandNameI18n[locale],
      brandName: storefront.brandNameI18n[locale],
      template: storefront.template,
      themeTokens: storefront.themeTokens,
      navigation: storefront.navigationI18n[locale] ?? [],
      promotions: promotionRows.map((promotion) => ({
        id: promotion.id,
        code: promotion.code,
        name: promotion.nameI18n[locale],
        description: promotion.descriptionI18n[locale],
        benefit: benefitLabel(promotion.benefit, locale),
        presentation: promotion.presentation,
      })),
    },
    release: releaseRows[0] ?? null,
    featuredTours,
  };
}
