import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { TourCard, TrustStrip } from "@toms/storefront-ui";
import { getBootstrap } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getBootstrap();
  const { t } = await getServerI18n();
  const hero = data.featuredTours[3] ?? data.featuredTours[0];
  if (!hero) return null;
  return (
    <main>
      <section className="hero">
        <Image
          src={hero.heroImageUrl}
          alt={hero.name}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />
        <div className="hero__content">
          <h1>{t("public.heroTitle")}</h1>
          <p>{t("public.heroDescription")}</p>
          <div className="hero__actions">
            <Link className="primary-link" href="/tours">
              {t("public.findTrip")} <ArrowRight size={16} />
            </Link>
            <Link className="secondary-link" href="/about">
              {t("nav.about")}
            </Link>
          </div>
        </div>
      </section>
      <form className="search-panel" action="/tours">
        <label className="field">
          <span>{t("public.where")}</span>
          <input name="q" placeholder={t("public.searchExample")} />
        </label>
        <label className="field">
          <span>{t("public.when")}</span>
          <input type="month" name="month" defaultValue="2026-10" />
        </label>
        <label className="field">
          <span>{t("public.tripType")}</span>
          <select name="type">
            <option>{t("public.allTours")}</option>
            <option>{t("public.adventure")}</option>
            <option>{t("public.cultural")}</option>
          </select>
        </label>
        <button type="submit">
          <Search size={15} /> {t("common.search")}
        </button>
      </form>
      <section className="section">
        <div className="page-container">
          <header className="section-header">
            <div>
              <h2>{t("public.featuredTours")}</h2>
              <p>{t("public.featuredDescription")}</p>
            </div>
            <Link href="/tours">{t("public.viewAll")} →</Link>
          </header>
          <div className="tour-grid">
            {data.featuredTours.slice(0, 4).map((tour) => (
              <TourCard
                key={tour.id}
                tour={{
                  slug: tour.slug,
                  name: tour.name,
                  summary: tour.summary,
                  heroImageUrl: tour.heroImageUrl,
                  durationDays: tour.durationDays,
                  priceMinor: tour.basePriceMinor,
                  currency: tour.currency,
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <TrustStrip />
      <section className="section">
        <div className="page-container promo-banner">
          <div>
            <h2>{t("public.earlyBooking")}</h2>
            <p>{t("public.promotionDescription")}</p>
            <Link className="primary-link" href="/promotions">
              {t("public.viewPromotions")}
            </Link>
          </div>
          <div className="promo-codes">
            {data.storefront.promotions.map((promotion) => (
              <div className="promo-code" key={promotion.id}>
                <strong>{promotion.code}</strong>
                <span>
                  {promotion.name} · {promotion.benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
