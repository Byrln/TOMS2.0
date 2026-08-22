"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CircleUserRound, Globe2, Headphones, Menu, Search, ShieldCheck } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { intlLocale } from "@toms/i18n";
import { useLocale } from "@toms/i18n/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

const navigation = [{ href: "/tours", key: "nav.publicTours" }, { href: "/destinations", key: "nav.destinations" }, { href: "/promotions", key: "nav.promotions" }, { href: "/about", key: "nav.about" }, { href: "/contact", key: "nav.contact" }] as const;

export function StorefrontLogo() {
  const { t } = useLocale();
  return <Link className="storefront-logo" href="/" aria-label={t("public.homeAria")}><span className="storefront-logo__icon" aria-hidden="true">✦</span><span><strong>MUNKH</strong><small>DISCOVERY</small></span></Link>;
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return <div className="locale-switcher" role="group" aria-label={t("language.label")}><Button size="xs" variant={locale === "mn" ? "secondary" : "ghost"} aria-pressed={locale === "mn"} onClick={() => setLocale("mn")}>MN</Button><Button size="xs" variant={locale === "en" ? "secondary" : "ghost"} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</Button></div>;
}

export function StorefrontHeader() {
  const { t } = useLocale();
  return <header className="storefront-header"><StorefrontLogo /><nav aria-label={t("common.mainNavigation")}>{navigation.slice(0, 4).map((item) => <Link key={item.href} href={item.href}>{t(item.key)}</Link>)}</nav><div className="storefront-header__tools"><LocaleSwitcher /><Button variant="ghost" size="icon" render={<Link href="/tours" aria-label={t("common.search")} />}><Search /></Button><Button variant="outline" render={<Link href="/account" />}><CircleUserRound />{t("nav.myTrips")}</Button><Sheet><SheetTrigger render={<Button className="mobile-menu" variant="ghost" size="icon" aria-label={t("common.menu")} />}><Menu /></SheetTrigger><SheetContent side="right"><SheetHeader><SheetTitle><StorefrontLogo /></SheetTitle><SheetDescription>{t("common.mainNavigation")}</SheetDescription></SheetHeader><nav className="mobile-navigation">{navigation.map((item) => <Button key={item.href} variant="ghost" render={<Link href={item.href} />}><span>{t(item.key)}</span><ChevronRight /></Button>)}<Button render={<Link href="/account" />}><CircleUserRound />{t("nav.myTrips")}</Button></nav></SheetContent></Sheet></div></header>;
}

export interface TourCardView { slug: string; name: string; summary: string; heroImageUrl: string; durationDays: number; priceMinor: number; currency: string; destination?: string; nextAvailableOn?: string | null; availabilityLabel?: string; promotionLabel?: string | null; }
export function TourCard({ tour }: { tour: TourCardView }) {
  const { locale, t } = useLocale();
  return <article className="tour-card"><Link href={`/tours/${tour.slug}`} className="tour-card__image" aria-label={t("public.tourDetails", { name: tour.name })}><Image src={tour.heroImageUrl} alt={tour.name} fill sizes="(max-width: 720px) 92vw, (max-width: 1100px) 44vw, 360px" />{tour.promotionLabel ? <span className="tour-card__promotion">{tour.promotionLabel}</span> : null}</Link><div className="tour-card__body"><p>{tour.destination ? `${tour.destination} · ` : ""}{t("common.days", { count: tour.durationDays })}</p><h3><Link href={`/tours/${tour.slug}`}>{tour.name}</Link></h3><span>{tour.summary}</span><div><span>{tour.nextAvailableOn ?? tour.availabilityLabel ?? ""}</span><strong>{formatCurrencyMinor(tour.priceMinor, tour.currency, intlLocale(locale))}</strong><Button variant="link" render={<Link href={`/tours/${tour.slug}`} />}><span>{t("common.details")}</span><ChevronRight /></Button></div></div></article>;
}

export function TrustStrip({ items }: { items?: Array<{ id: string; title: string; description: string }> }) {
  const { t } = useLocale();
  const defaults = [{ id: "secure", icon: ShieldCheck, title: t("public.securePayment"), description: t("public.securePaymentDetail") }, { id: "support", icon: Headphones, title: t("public.support"), description: t("public.supportDetail") }, { id: "local", icon: Globe2, title: t("public.localKnowledge"), description: t("public.localKnowledgeDetail") }];
  return <section className="trust-strip" aria-label={t("public.whyUs")}>{(items ?? defaults).map((item, index) => { const Icon = defaults[index % defaults.length]!.icon; return <div key={item.id}><Icon aria-hidden="true" /><strong>{item.title}</strong><span>{item.description}</span></div>; })}</section>;
}

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";
export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  return <Badge variant={tone === "danger" ? "destructive" : tone === "success" ? "default" : "secondary"} className={`status-badge status-badge--${tone}`}><span className="status-badge__dot" aria-hidden="true" />{children}</Badge>;
}

export function StorefrontFooter() {
  const { t } = useLocale();
  return <footer className="storefront-footer"><div><StorefrontLogo /><p>{t("public.footerText")}</p></div><div><strong>{t("public.travel")}</strong><Link href="/tours">{t("nav.publicTours")}</Link><Link href="/destinations">{t("nav.destinations")}</Link><Link href="/promotions">{t("nav.promotions")}</Link></div><div><strong>{t("public.help")}</strong><Link href="/contact">{t("nav.contact")}</Link><Link href="/account">{t("nav.myTrips")}</Link></div><small>{t("public.rights")}</small></footer>;
}
export function Surface({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`storefront-surface ${className}`}>{children}</section>; }
