"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  CircleUserRound,
  Globe2,
  Headphones,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { intlLocale } from "@toms/i18n";
import { useLocale } from "@toms/i18n/react";

export function StorefrontLogo() {
  const { t } = useLocale();
  return (
    <Link className="storefront-logo" href="/" aria-label={t("public.homeAria")}>
      <span className="storefront-logo__icon" aria-hidden="true">
        ✦
      </span>
      <strong>TOMS</strong>
    </Link>
  );
}

export function StorefrontHeader() {
  const { t } = useLocale();
  return (
    <header className="storefront-header">
      <StorefrontLogo />
      <nav aria-label={t("common.mainNavigation")}>
        <Link href="/tours">{t("nav.publicTours")}</Link>
        <Link href="/destinations">{t("nav.destinations")}</Link>
        <Link href="/promotions">{t("nav.promotions")}</Link>
        <Link href="/about">{t("nav.about")}</Link>
      </nav>
      <div className="storefront-header__tools">
        <LocaleSwitcher />
        <Link href="/tours" aria-label={t("common.search")}>
          <Search size={17} />
        </Link>
        <Link href="/account/trips">
          <CircleUserRound size={17} />
          {t("nav.myTrips")}
        </Link>
        <Link href="/tours" className="mobile-menu" aria-label={t("common.menu")}>
          <Menu size={20} />
        </Link>
      </div>
    </header>
  );
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return <div className="locale-switcher" role="group" aria-label={t("language.label")}>
    <button type="button" aria-pressed={locale === "mn"} aria-label={t("language.switchToMn")} onClick={() => setLocale("mn")}>MN</button>
    <button type="button" aria-pressed={locale === "en"} aria-label={t("language.switchToEn")} onClick={() => setLocale("en")}>EN</button>
  </div>;
}

export interface TourCardView {
  slug: string;
  name: string;
  summary: string;
  heroImageUrl: string;
  durationDays: number;
  priceMinor: number;
  currency: string;
}

export function TourCard({ tour }: { tour: TourCardView }) {
  const { locale, t } = useLocale();
  return (
    <article className="tour-card">
      <Link
        href={`/tours/${tour.slug}`}
        className="tour-card__image"
        aria-label={t("public.tourDetails", { name: tour.name })}
      >
        <Image
          src={tour.heroImageUrl}
          alt={tour.name}
          fill
          sizes="(max-width: 720px) 88vw, (max-width: 1100px) 44vw, 320px"
        />
      </Link>
      <div className="tour-card__body">
        <p>{t("common.days", { count: tour.durationDays })}</p>
        <h3>
          <Link href={`/tours/${tour.slug}`}>{tour.name}</Link>
        </h3>
        <span>{tour.summary}</span>
        <div>
          <strong>{formatCurrencyMinor(tour.priceMinor, tour.currency, intlLocale(locale))}</strong>
          <Link href={`/tours/${tour.slug}`}>
            {t("common.details")} <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TrustStrip() {
  const { t } = useLocale();
  return (
    <section className="trust-strip" aria-label={t("public.whyUs")}>
      <div>
        <ShieldCheck />
        <strong>{t("public.securePayment")}</strong>
        <span>{t("public.securePaymentDetail")}</span>
      </div>
      <div>
        <Headphones />
        <strong>{t("public.support")}</strong>
        <span>{t("public.supportDetail")}</span>
      </div>
      <div>
        <Globe2 />
        <strong>{t("public.localKnowledge")}</strong>
        <span>{t("public.localKnowledgeDetail")}</span>
      </div>
    </section>
  );
}

export function StorefrontFooter() {
  const { t } = useLocale();
  return (
    <footer className="storefront-footer">
      <div>
        <StorefrontLogo />
        <p>{t("public.footerText")}</p>
      </div>
      <div>
        <strong>{t("public.travel")}</strong>
        <Link href="/tours">{t("nav.publicTours")}</Link>
        <Link href="/promotions">{t("nav.promotions")}</Link>
      </div>
      <div>
        <strong>{t("public.help")}</strong>
        <Link href="/contact">{t("nav.contact")}</Link>
        <Link href="/account/trips">{t("nav.myTrips")}</Link>
      </div>
      <small>{t("public.rights")}</small>
    </footer>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`storefront-surface ${className}`}>{children}</section>
  );
}
