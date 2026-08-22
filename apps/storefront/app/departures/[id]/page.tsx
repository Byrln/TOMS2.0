import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, UsersRound } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { getTours } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";
import { intlLocale } from "@toms/i18n";

export const dynamic = "force-dynamic";
export default async function DeparturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tours = await getTours();
  const { locale, t } = await getServerI18n();
  const tour = tours.find((item) => item.departures.some((departure) => departure.id === id));
  const departure = tour?.departures.find((item) => item.id === id);
  if (!tour || !departure) notFound();
  return <main><header className="page-hero"><div><p>{tour.destinations.join(" · ")}</p><h1>{tour.name}</h1><p>{departure.code}</p></div></header><section className="section"><div className="page-container departure-detail"><article className="portal-panel"><h2>{t("tour.departureInformation")}</h2><div className="summary-row"><span><CalendarDays size={15} /> {t("checkout.date")}</span><strong>{departure.startsOn} → {departure.endsOn}</strong></div><div className="summary-row"><span><UsersRound size={15} /> {t("admin.capacity")}</span><strong>{departure.confirmedCount} / {departure.capacity}</strong></div><div className="summary-row total"><span>{t("checkout.unitPrice")}</span><strong>{formatCurrencyMinor(departure.priceMinor, departure.currency, intlLocale(locale))}</strong></div><Link className="primary-link" href={`/checkout/${departure.id}`}>{t("tour.bookNow")}</Link></article><article className="portal-panel"><h2>{t("tours.itinerary")}</h2><p>{tour.description}</p><Link className="secondary-link departure-back" href={`/tours/${tour.slug}`}>{t("tour.viewDetails")}</Link></article></div></section></main>;
}
