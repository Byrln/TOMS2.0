"use client";
/* eslint-disable react/jsx-key -- cell elements are wrapped in keyed table cells at the render boundary */

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { StatusBadge } from "@toms/admin-ui";
import { intlLocale, statusLabel } from "@toms/i18n";
import { useLocale } from "@toms/i18n/react";

type Row = Record<string, unknown>;

function text(value: unknown) { return String(value ?? "—"); }
function tone(value: unknown) {
  const normalized = text(value).toUpperCase();
  if (["CONFIRMED", "PUBLISHED", "SUCCEEDED", "PAID", "ACTIVE", "GUARANTEED", "READY", "MATCHED"].includes(normalized)) return "success" as const;
  if (["PENDING", "DRAFT", "OPEN", "HELD", "UNPAID", "MISSING", "UNMATCHED"].includes(normalized)) return "warning" as const;
  if (["FAILED", "CANCELLED", "EXPIRED", "VOID"].includes(normalized)) return "danger" as const;
  return "neutral" as const;
}

function TableFrame({ rows, labels, cells }: { rows: Row[]; labels: string[]; cells(row: Row): ReactNode[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const filtered = useMemo(() => rows.filter((row) => Object.values(row).some((value) => text(value).toLowerCase().includes(deferred))), [deferred, rows]);
  return <section className="panel data-panel">
    <div className="table-toolbar"><label className="admin-search filter-input"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("common.searchPlaceholder")} aria-label={t("admin.searchList")} /></label><div className="table-toolbar__meta"><SlidersHorizontal size={14} /> {t("table.total", { count: filtered.length })}</div></div>
    <div className="data-table-wrap"><table className="data-table"><thead><tr>{labels.map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={labels.length} className="data-table__empty">{t("state.empty")}</td></tr> : filtered.map((row, index) => <tr key={text(row.id ?? index)}>{cells(row).map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
  </section>;
}

function Status({ value }: { value: unknown }) {
  const { locale } = useLocale();
  return <StatusBadge tone={tone(value)}>{statusLabel(locale, text(value))}</StatusBadge>;
}

function Money({ amount, currency }: { amount: unknown; currency: unknown }) {
  const { locale } = useLocale();
  return <strong>{formatCurrencyMinor(Number(amount ?? 0), text(currency ?? "MNT"), intlLocale(locale))}</strong>;
}

function DateValue({ value }: { value: unknown }) {
  const { locale } = useLocale();
  if (!value) return <>—</>;
  const date = new Date(text(value));
  return <>{Number.isNaN(date.valueOf()) ? text(value) : new Intl.DateTimeFormat(intlLocale(locale), { year: "numeric", month: "short", day: "2-digit" }).format(date)}</>;
}

export function ToursTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.tourName"), t("admin.duration"), t("admin.destinations"), t("admin.languages"), t("admin.status"), t("admin.createdAt")]} cells={(row) => [<strong>{text(row.name)}</strong>, `${text(row.durationDays)} ${t("admin.days")} / ${text(row.durationNights)} ${t("admin.nights")}`, Array.isArray(row.destinations) ? row.destinations.join(", ") : text(row.destinations), Array.isArray(row.languages) ? row.languages.join(", ").toUpperCase() : text(row.languages), <Status value={row.status} />, <DateValue value={row.createdAt} />]} />;
}

export function DeparturesTable({ rows }: { rows: Row[] }) {
  const { locale, t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.code"), t("admin.tour"), t("admin.startDate"), t("admin.endDate"), t("admin.confirmedCapacity"), t("admin.tripStatus"), t("admin.status")]} cells={(row) => [<strong>{text(row.code)}</strong>, text((row.tourNameI18n as Record<string, unknown> | undefined)?.[locale] ?? row.tourName), <DateValue value={row.startsOn} />, <DateValue value={row.endsOn} />, `${text(row.confirmedCount)} / ${text(row.capacity)}`, <Status value={row.tripStatus} />, <Status value={row.status} />]} />;
}

export function BookingsTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.bookingNumber"), t("admin.email"), t("admin.partySize"), t("admin.status"), t("admin.paymentStatus"), t("admin.total"), t("admin.createdAt")]} cells={(row) => [<strong>{text(row.bookingNumber)}</strong>, text(row.organizerEmail), text(row.partySize), <Status value={row.status} />, <Status value={row.paymentStatus} />, <Money amount={row.totalMinor} currency={row.currency} />, <DateValue value={row.createdAt} />]} />;
}

export function TravelersTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.firstName"), t("admin.lastName"), t("admin.email"), t("admin.nationality"), t("admin.documentReadiness"), t("admin.visaStatus"), t("admin.createdAt")]} cells={(row) => [text(row.firstName), <strong>{text(row.lastName)}</strong>, text(row.email), text(row.nationality), <Status value={row.documentReadiness} />, <Status value={row.visaStatus} />, <DateValue value={row.createdAt} />]} />;
}

export function CustomersTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.name"), t("admin.email"), t("admin.organization"), t("admin.segment"), t("admin.source"), t("admin.createdAt")]} cells={(row) => [<strong>{[row.firstName, row.lastName].filter(Boolean).map(text).join(" ") || "—"}</strong>, text(row.email), text(row.organization), <Status value={row.segment} />, text(row.source), <DateValue value={row.createdAt} />]} />;
}

export function ConversationsTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.subject"), t("admin.channel"), t("admin.status"), t("admin.bookingNumber"), t("admin.updatedAt")]} cells={(row) => [<strong>{text(row.subject)}</strong>, text(row.channel), <Status value={row.status} />, text(row.bookingId), <DateValue value={row.updatedAt} />]} />;
}

export function PaymentsTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.provider"), t("admin.providerTransaction"), t("admin.status"), t("admin.total"), t("admin.reconciliation"), t("admin.createdAt")]} cells={(row) => [<strong>{text(row.provider)}</strong>, text(row.providerTransactionId), <Status value={row.status} />, <Money amount={row.amountMinor} currency={row.currency} />, <Status value={row.reconciliationStatus} />, <DateValue value={row.createdAt} />]} />;
}

export function InvoicesTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.invoiceNumber"), t("admin.status"), t("admin.total"), t("admin.paid"), t("admin.issuedAt"), t("admin.dueAt")]} cells={(row) => [<strong>{text(row.invoiceNumber)}</strong>, <Status value={row.status} />, <Money amount={row.totalMinor} currency={row.currency} />, <Money amount={row.paidMinor} currency={row.currency} />, <DateValue value={row.issuedAt} />, <DateValue value={row.dueAt} />]} />;
}

export function DocumentsTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.documentTitle"), t("admin.type"), t("admin.visibility"), t("admin.contentType"), t("admin.expiresAt"), t("admin.createdAt")]} cells={(row) => [<strong>{text(row.title)}</strong>, text(row.type), <Status value={row.visibility} />, text(row.contentType), <DateValue value={row.expiresAt} />, <DateValue value={row.createdAt} />]} />;
}

export function PromotionsTable({ rows }: { rows: Row[] }) {
  const { t } = useLocale();
  return <TableFrame rows={rows} labels={[t("admin.code"), t("admin.name"), t("admin.presentation"), t("admin.status"), t("admin.startDate"), t("admin.endDate"), t("admin.redemptionLimit")]} cells={(row) => [<strong>{text(row.code)}</strong>, text(row.name), text(row.presentation), <Status value={row.status} />, <DateValue value={row.startsAt} />, <DateValue value={row.endsAt} />, text(row.redemptionLimit)]} />;
}
