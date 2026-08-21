import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Plus, Users } from "lucide-react";
import { AdminShell, Button, MetricCard, PageHeader, StatusBadge } from "@toms/admin-ui";
import { formatCurrencyMinor } from "@toms/config";
import { getAdminJson } from "@/lib/api";
import type { ModuleDefinition } from "@/lib/modules";
import { ResourceTable } from "./resource-table";

type DashboardData = { metrics: { grossBookingValueMinor: number; confirmedBookings: number; upcomingDepartures: number; travelers: number; storefrontConversion: number }; revenueTrend: number[]; bookingsByStatus: Array<{ status: string; count: number }>; upcomingDepartures: Array<{ id: string; tourName: string; startsOn: string; confirmedCount: number; capacity: number; status: string }> };

function actionButtons(path: string, definition: ModuleDefinition) {
  const createHref = path === "/" ? "/reports" : path === "/tours" ? "/tours/new" : path === "/departures" ? "/departures/new" : `${path}?action=create`;
  const actionLabel = path === "/" ? "Тайлан харах" : definition.action;
  return <><Link className="button button--ghost" href={`${path}?export=csv`}>Экспорт</Link><Link className="button button--primary" href={createHref}><Plus size={14} /> {actionLabel}</Link></>;
}

async function Dashboard() {
  const data = await getAdminJson<DashboardData>("/api/v1/admin/dashboard");
  const max = Math.max(...data.revenueTrend);
  return <><div className="metric-grid"><MetricCard label="Нийт орлого" value={formatCurrencyMinor(data.metrics.grossBookingValueMinor)} change="+12.4%" /><MetricCard label="Батлагдсан захиалга" value={data.metrics.confirmedBookings.toLocaleString()} change="+8.7%" /><MetricCard label="Удахгүй гарах аялал" value={String(data.metrics.upcomingDepartures)} change="3 анхаарах" tone="warning" /><MetricCard label="Аялагчид" value={data.metrics.travelers.toLocaleString()} change="+6.1%" /><MetricCard label="Storefront conversion" value={`${data.metrics.storefrontConversion}%`} change="+0.45pp" /></div><div className="dashboard-grid"><section className="panel"><div className="panel__header"><h2>Орлогын динамик</h2><StatusBadge tone="info">Сүүлийн 12 сар</StatusBadge></div><div className="panel__body"><div className="bar-chart" aria-label="Орлогын график">{data.revenueTrend.map((value, index) => <span key={index} style={{ "--bar": `${Math.round(value / max * 100)}%` } as React.CSSProperties} title={`${value} сая`} />)}</div></div></section><section className="panel"><div className="panel__header"><h2>Захиалгын төлөв</h2></div><div className="panel__body status-stack">{data.bookingsByStatus.map((item) => <div className="status-stack__row" key={item.status}><span>{item.status}</span><strong>{item.count}</strong><div><span style={{ width: `${Math.min(100, item.count / data.metrics.confirmedBookings * 100)}%` }} /></div></div>)}</div></section></div><section className="panel data-panel" style={{ marginTop: 14 }}><div className="panel__header"><h2>Сүүлийн хуваарьт гаралтууд</h2><Link href="/departures">Бүгдийг харах →</Link></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Аялал</th><th>Гарах огноо</th><th>Багтаамж</th><th>Төлөв</th><th></th></tr></thead><tbody>{data.upcomingDepartures.map((item) => <tr key={item.id}><td><strong>{item.tourName}</strong></td><td>{item.startsOn}</td><td>{item.confirmedCount} / {item.capacity}</td><td><StatusBadge tone="success">{item.status}</StatusBadge></td><td className="align-right"><ArrowUpRight size={15} /></td></tr>)}</tbody></table></div></section></>;
}

async function Operations({ resource }: { resource: string }) {
  const data = await getAdminJson<{ items: Record<string, unknown>[] }>(`/api/v1/admin/resources/${resource}`);
  return <><div className="module-grid"><article className="module-card"><CalendarDays /><h3>Өнөөдрийн төлөв</h3><p>Хуваарь, багтаамж болон баталгаажуулалтыг нэг үйл ажиллагааны үнэнээс хяна.</p></article><article className="module-card"><CheckCircle2 /><h3>Баталгаажуулалт</h3><p>Hotel, transport, guide, supplier бүрийн status нь тусдаа, шалгагдахуйц байна.</p></article><article className="module-card"><Users /><h3>Аялагчийн бэлэн байдал</h3><p>Паспорт, хүсэлт, өрөө, pickup, checklist-ийг departure түвшинд харуулна.</p></article></div><section className="panel route-board"><div><h3>Departure</h3>{data.items.slice(0, 6).map((item, index) => <p key={String(item.id ?? index)}><StatusBadge tone={index === 0 ? "success" : "neutral"}>{String(item.code ?? item.subject ?? `Item ${index + 1}`)}</StatusBadge></p>)}</div><div><h3>Өдрийн хөтөлбөр</h3>{["08:30 UBN → ICN", "12:50 Инчоны нисэх онгоцны буудал", "15:30 Hotel check-in", "19:00 Оройн хоол"].map((event, index) => <div className="timeline-event" key={event}><strong>{event}</strong><span>Day 1 · Traveler visible · {index + 1} confirmation</span></div>)}</div><div><h3>Анхаарах зүйлс</h3><p>2 паспорт дутуу</p><p>1 supplier confirmation</p><p>Pickup 83% бэлэн</p><StatusBadge tone="warning">Action required</StatusBadge></div></section></>;
}

function StorefrontModule() { return <><div className="metric-grid"><MetricCard label="Нийт storefront" value="24" change="+2" /><MetricCard label="Нийт сесс" value="128,650" change="+10.2%" /><MetricCard label="Хувиргалт" value="3.62%" change="+0.45pp" /><MetricCard label="Орлого" value="₮ 1,286,650,000" change="+12.4%" /><MetricCard label="Published" value="18" change="6 draft" tone="warning" /></div><div className="module-grid"><article className="module-card"><Image src="/images/altai.png" width={500} height={220} alt="Himalaya theme" /><h3>Himalaya</h3><p>Adventure & Mountain · Published</p></article><article className="module-card"><Image src="/images/seoul.png" width={500} height={220} alt="Aurora theme" /><h3>Aurora</h3><p>Modern & Clean · Preview</p></article><article className="module-card"><Image src="/images/gobi.png" width={500} height={220} alt="Gobi theme" /><h3>Gobi</h3><p>Desert & Discovery · Draft</p></article></div></>; }

function CmsModule() { return <section className="panel route-board"><div><h3>Хуудасны бүтэц</h3>{["Hero section", "Search", "Featured tours", "Why travel with us", "Destinations", "Testimonials", "Newsletter", "Footer"].map((item, index) => <p key={item}><StatusBadge tone={index === 0 ? "warning" : "neutral"}>{index + 1}. {item}</StatusBadge></p>)}</div><article className="cms-preview"><Image src="/images/altai.png" fill sizes="600px" alt="Storefront hero preview" /><div><h3>Дэлхийг өөрийнхөөрөө мэдэр</h3><p>Яг одоо баталгаатай аяллаа сонго.</p><Button>Аяллаа хайх</Button></div></article><div><h3>SEO & Нийтлэлийн тохиргоо</h3><p>Page title</p><strong>Munkh Discovery — Аялал</strong><hr /><p>Locale</p><strong>MN, EN</strong><hr /><p>Release</p><StatusBadge tone="success">Ready to publish</StatusBadge></div></section>; }

function Reports() { return <><div className="metric-grid"><MetricCard label="Gross Booking Value" value="₮ 1.28B" change="+12.4%" /><MetricCard label="Direct booking" value="42%" change="+5.1pp" /><MetricCard label="Average booking" value="₮ 3.2M" change="+4.0%" /><MetricCard label="Add-on attach" value="18.6%" change="+2.3pp" /><MetricCard label="Refund rate" value="1.8%" change="-0.4pp" /></div><section className="panel"><div className="panel__header"><h2>Борлуулалтын үндсэн чиг хандлага</h2></div><div className="panel__body"><div className="bar-chart">{[48,55,43,65,71,68,79,86,74,93,88,100].map((value) => <span key={value} style={{ "--bar": `${value}%` } as React.CSSProperties} />)}</div></div></section></>; }

function SettingsModule() { return <div className="module-grid">{[{title:"Компани",text:"Нэр, хаяг, tax, brand identity"},{title:"Баг ба эрх",text:"Membership, RBAC, session, MFA"},{title:"Localization",text:"MN/EN, timezone, currency, FX"},{title:"Payments",text:"QPay, Stripe, reconciliation"},{title:"Domains",text:"Custom domain, canonical URL, SSL"},{title:"Security",text:"Audit, storage, headers, access"}].map((item) => <article className="module-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p><br /><StatusBadge tone="success">Configured</StatusBadge></article>)}</div>; }

export async function AdminPage({ path, definition }: { path: string; definition: ModuleDefinition }) {
  let content: React.ReactNode;
  if (definition.type === "dashboard") content = await Dashboard();
  else if (definition.type === "operations") content = await Operations({ resource: definition.resource ?? "operations" });
  else if (definition.type === "storefront") content = <StorefrontModule />;
  else if (definition.type === "cms") content = <CmsModule />;
  else if (definition.type === "reports") content = <Reports />;
  else if (definition.type === "settings") content = <SettingsModule />;
  else {
    const resource = definition.resource ?? "tours";
    const data = await getAdminJson<{ items: Record<string, unknown>[] }>(`/api/v1/admin/resources/${resource}`);
    content = definition.type === "promotions" ? <><div className="metric-grid"><MetricCard label="Нийт урамшуулал" value="128" change="+6" /><MetricCard label="Ашигласан" value="2,845" change="+12.0%" /><MetricCard label="Орлого" value="₮ 342.6M" change="+9.0%" /><MetricCard label="ROI" value="8.72x" change="+0.6x" /><MetricCard label="Active" value="18" change="6 scheduled" tone="warning" /></div><ResourceTable rows={data.items} resource={resource} /></> : <ResourceTable rows={data.items} resource={resource} />;
  }
  return <AdminShell activePath={path}><PageHeader eyebrow={path === "/" ? "Travel Operations OS" : "TOMS Workspace"} title={definition.title} description={definition.description} actions={actionButtons(path, definition)} />{content}</AdminShell>;
}
