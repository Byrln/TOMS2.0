import Link from "next/link";
import { Check, Download, UserRoundCheck } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { intlLocale, statusLabel } from "@toms/i18n";
import { getTrip } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, { locale, t }] = await Promise.all([getTrip(id), getServerI18n()]);
  return <main className="confirmation-wrap">
    <div className="confirmation-icon"><Check size={32} /></div>
    <h1>{t("confirmation.success")}</h1>
    <p>{t("confirmation.sent", { email: trip.organizerEmail })}</p>
    <section className="confirmation-card">
      <div><small>{t("confirmation.bookingNumber")}</small><h2>{trip.bookingNumber}</h2><p>{trip.tour.name}<br />{trip.departure.startsOn} → {trip.departure.endsOn}</p></div>
      <div><small>{t("confirmation.invoice")}</small><h2>{trip.invoiceNumber}</h2><p>{formatCurrencyMinor(trip.totalMinor, trip.currency, intlLocale(locale))} · {statusLabel(locale, trip.paymentStatus)}</p></div>
    </section>
    <div className="confirmation-actions">
      <Link className="primary-link" href={`/account/trips/${trip.id}`}><UserRoundCheck size={16} /> {t("confirmation.openTrip")}</Link>
      <Link className="secondary-link" style={{ color: "#071d35", borderColor: "#d9e0e7" }} href={`/account/trips/${trip.id}#documents`}><Download size={16} /> {t("portal.documents")}</Link>
    </div>
  </main>;
}
