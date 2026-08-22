import Link from "next/link";
import { CalendarDays, FileText, Headphones, MapPin, ReceiptText } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { intlLocale, statusLabel } from "@toms/i18n";
import { getTrip } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ locale, t }, trip] = await Promise.all([getServerI18n(), getTrip(id)]);
  return <main className="portal-shell">
    <aside className="portal-sidebar"><h2>{trip.tour.name}</h2><nav>
      <Link href={`/account/trips/${id}`}><span>{t("portal.overview")}</span></Link>
      <Link href="#timeline"><span>{t("portal.schedule")}</span></Link>
      <Link href="#documents"><span>{t("portal.documents")}</span></Link>
      <Link href="#payments"><span>{t("finance.payment")}</span></Link>
    </nav></aside>
    <section className="portal-content">
      <h1>{trip.tour.name}</h1>
      <p>{trip.departure.startsOn} → {trip.departure.endsOn} · {t("common.people", { count: trip.partySize })} · {statusLabel(locale, trip.status)}</p>
      <div className="trip-detail-grid">
        <section className="portal-panel" id="timeline"><h2>{t("portal.timeline")}</h2><div className="trip-timeline">{trip.itinerary.map((event) => <article className="trip-event" key={event.id}><time>{new Date(event.startsAt).toLocaleTimeString(intlLocale(locale), { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ulaanbaatar" })}</time><h3>{event.title}</h3><p><MapPin size={12} /> {event.location}<br />{event.details}</p></article>)}</div></section>
        <aside>
          <section className="portal-panel" id="payments"><h2>{t("portal.paymentStatus")}</h2><div className="summary-row"><span>{t("finance.total")}</span><strong>{formatCurrencyMinor(trip.totalMinor, trip.currency, intlLocale(locale))}</strong></div><div className="summary-row"><span>{t("portal.status")}</span><strong>{statusLabel(locale, trip.paymentStatus)}</strong></div><div className="summary-row"><span>{t("portal.invoice")}</span><strong>{trip.invoiceNumber}</strong></div></section>
          <section className="portal-panel" id="documents" style={{ marginTop: 14 }}><h2>{t("portal.quickAccess")}</h2><div className="quick-actions"><Link href="#timeline"><CalendarDays /> {t("portal.schedule")}</Link><Link href="#documents"><FileText /> {t("portal.eVoucher")}</Link><Link href="#payments"><ReceiptText /> {t("portal.invoice")}</Link><Link href="/contact"><Headphones /> {t("public.help")}</Link></div></section>
        </aside>
      </div>
    </section>
  </main>;
}
