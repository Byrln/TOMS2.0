import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MetricCard, StatusBadge } from "@toms/admin-ui";
import { formatCurrencyMinor } from "@toms/config";
import { intlLocale, statusLabel } from "@toms/i18n";
import { getAdminJson } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

type DashboardData = {
  metrics: { grossBookingValueMinor: number; confirmedBookings: number; upcomingDepartures: number; travelers: number; storefrontConversion: number };
  revenueTrend: number[];
  bookingsByStatus: Array<{ status: string; count: number }>;
  upcomingDepartures: Array<{ id: string; tourName: string; startsOn: string; confirmedCount: number; capacity: number; status: string }>;
};

export async function DashboardSection() {
  const [{ locale, t }, data] = await Promise.all([getServerI18n(), getAdminJson<DashboardData>("/api/v1/admin/dashboard")]);
  const max = Math.max(...data.revenueTrend, 1);
  const confirmed = Math.max(1, data.metrics.confirmedBookings);
  const date = (value: string) => new Intl.DateTimeFormat(intlLocale(locale), { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
  return <>
    <div className="metric-grid">
      <MetricCard label={t("dashboard.revenue")} value={formatCurrencyMinor(data.metrics.grossBookingValueMinor, "MNT", intlLocale(locale))} />
      <MetricCard label={t("dashboard.bookings")} value={data.metrics.confirmedBookings.toLocaleString(intlLocale(locale))} />
      <MetricCard label={t("dashboard.departures")} value={String(data.metrics.upcomingDepartures)} />
      <MetricCard label={t("dashboard.travelers")} value={data.metrics.travelers.toLocaleString(intlLocale(locale))} />
      <MetricCard label={t("storefront.conversion")} value={`${data.metrics.storefrontConversion}%`} tone="info" />
    </div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel__header"><h2>{t("dashboard.revenueTrend")}</h2><StatusBadge tone="info">{t("admin.lastTwelveMonths")}</StatusBadge></div><div className="panel__body"><div className="bar-chart" aria-label={t("admin.revenueChart")}>{data.revenueTrend.length === 0 ? <p>{t("state.empty")}</p> : data.revenueTrend.map((value, index) => <span key={index} style={{ "--bar": `${Math.round(value / max * 100)}%` } as React.CSSProperties} title={t("admin.valueMillions", { value })} />)}</div></div></section>
      <section className="panel"><div className="panel__header"><h2>{t("admin.bookingStatus")}</h2></div><div className="panel__body status-stack">{data.bookingsByStatus.length === 0 ? <p>{t("state.empty")}</p> : data.bookingsByStatus.map((item) => <div className="status-stack__row" key={item.status}><span>{statusLabel(locale, item.status)}</span><strong>{item.count}</strong><div><span style={{ width: `${Math.min(100, item.count / confirmed * 100)}%` }} /></div></div>)}</div></section>
    </div>
    <section className="panel data-panel" style={{ marginTop: 14 }}><div className="panel__header"><h2>{t("admin.latestDepartures")}</h2><Link href="/departures">{t("admin.viewAll")} →</Link></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>{t("admin.tour")}</th><th>{t("admin.startDate")}</th><th>{t("admin.capacity")}</th><th>{t("admin.status")}</th><th></th></tr></thead><tbody>{data.upcomingDepartures.length === 0 ? <tr><td colSpan={5} className="data-table__empty">{t("state.empty")}</td></tr> : data.upcomingDepartures.map((item) => <tr key={item.id}><td><strong>{item.tourName}</strong></td><td>{date(item.startsOn)}</td><td>{item.confirmedCount} / {item.capacity}</td><td><StatusBadge tone="success">{statusLabel(locale, item.status)}</StatusBadge></td><td className="align-right"><ArrowUpRight size={15} /></td></tr>)}</tbody></table></div></section>
  </>;
}
