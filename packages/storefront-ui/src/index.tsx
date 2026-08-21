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

export function StorefrontLogo() {
  return (
    <Link className="storefront-logo" href="/" aria-label="TOMS нүүр">
      <span className="storefront-logo__icon" aria-hidden="true">
        ✦
      </span>
      <strong>TOMS</strong>
    </Link>
  );
}

export function StorefrontHeader() {
  return (
    <header className="storefront-header">
      <StorefrontLogo />
      <nav aria-label="Үндсэн цэс">
        <Link href="/tours">Аяллууд</Link>
        <Link href="/destinations">Очих газар</Link>
        <Link href="/promotions">Урамшуулал</Link>
        <Link href="/about">Бидний тухай</Link>
      </nav>
      <div className="storefront-header__tools">
        <Link href="/tours" aria-label="Хайх">
          <Search size={17} />
        </Link>
        <Link href="/account/trips">
          <CircleUserRound size={17} />
          Миний аялал
        </Link>
        <Link href="/tours" className="mobile-menu" aria-label="Цэс">
          <Menu size={20} />
        </Link>
      </div>
    </header>
  );
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
  return (
    <article className="tour-card">
      <Link
        href={`/tours/${tour.slug}`}
        className="tour-card__image"
        aria-label={`${tour.name} дэлгэрэнгүй`}
      >
        <Image
          src={tour.heroImageUrl}
          alt={tour.name}
          fill
          sizes="(max-width: 720px) 88vw, (max-width: 1100px) 44vw, 320px"
        />
      </Link>
      <div className="tour-card__body">
        <p>{tour.durationDays} өдөр</p>
        <h3>
          <Link href={`/tours/${tour.slug}`}>{tour.name}</Link>
        </h3>
        <span>{tour.summary}</span>
        <div>
          <strong>{formatCurrencyMinor(tour.priceMinor, tour.currency)}</strong>
          <Link href={`/tours/${tour.slug}`}>
            Дэлгэрэнгүй <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="TOMS-ийн давуу тал">
      <div>
        <ShieldCheck />
        <strong>Аюулгүй төлбөр</strong>
        <span>Баталгаатай захиалга</span>
      </div>
      <div>
        <Headphones />
        <strong>24/7 дэмжлэг</strong>
        <span>Аяллын турш</span>
      </div>
      <div>
        <Globe2 />
        <strong>Орон нутгийн мэдлэг</strong>
        <span>Шалгарсан түншүүд</span>
      </div>
    </section>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="storefront-footer">
      <div>
        <StorefrontLogo />
        <p>Аяллын эхний асуултаас эцсийн өдөр хүртэлх итгэлтэй туршлага.</p>
      </div>
      <div>
        <strong>Аялал</strong>
        <Link href="/tours">Бүх аялал</Link>
        <Link href="/promotions">Урамшуулал</Link>
      </div>
      <div>
        <strong>Тусламж</strong>
        <Link href="/contact">Холбоо барих</Link>
        <Link href="/account/trips">Миний аялал</Link>
      </div>
      <small>© 2026 TOMS. Бүх эрх хуулиар хамгаалагдсан.</small>
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
