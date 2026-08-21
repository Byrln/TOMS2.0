"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { StatusBadge } from "@toms/admin-ui";

type RecordRow = Record<string, unknown>;

function scalar(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "—");
}

function tone(value: string) {
  const normalized = value.toUpperCase();
  if (["CONFIRMED", "PUBLISHED", "SUCCEEDED", "PAID", "ACTIVE", "GUARANTEED", "READY"].includes(normalized)) return "success" as const;
  if (["PENDING", "DRAFT", "OPEN", "HELD"].includes(normalized)) return "warning" as const;
  if (["FAILED", "CANCELLED", "EXPIRED"].includes(normalized)) return "danger" as const;
  return "neutral" as const;
}

export function ResourceTable({ rows, resource }: { rows: RecordRow[]; resource: string }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filtered = useMemo(() => rows.filter((row) => Object.values(row).some((value) => scalar(value).toLowerCase().includes(deferredQuery))), [deferredQuery, rows]);
  const preferred = ["name", "bookingNumber", "code", "fullName", "email", "status", "startsOn", "endsOn", "amountMinor", "totalMinor", "currency", "provider", "invoiceNumber", "type"];
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).filter((key) => !["description", "departures", "highlights", "inclusions", "destinations", "heroImageUrl", "tourId", "organizerEmail", "travelers", "id"].includes(key));
  const columns = [...preferred.filter((key) => keys.includes(key)), ...keys.filter((key) => !preferred.includes(key))].slice(0, 7);

  return <section className="panel data-panel"><div className="table-toolbar"><label className="admin-search filter-input"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`${resource} хайх...`} aria-label="Жагсаалтаас хайх" /></label><div className="table-toolbar__meta"><SlidersHorizontal size={14} /> Нийт {filtered.length}</div></div><div className="data-table-wrap"><table className="data-table"><thead><tr>{columns.map((key) => <th key={key}>{key.replace(/([A-Z])/g, " $1")}</th>)}</tr></thead><tbody>{filtered.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map((key) => {
    const value = row[key];
    if (key === "name") return <td key={key}><span className="entity-primary">{typeof row.heroImageUrl === "string" ? <Image src={row.heroImageUrl} alt="" width={52} height={34} /> : null}<span><strong>{scalar(value)}</strong><span>{scalar(row.slug ?? row.email ?? row.code ?? "TOMS record")}</span></span></span></td>;
    if (key.toLowerCase().includes("status")) return <td key={key}><StatusBadge tone={tone(scalar(value))}>{scalar(value)}</StatusBadge></td>;
    if (key.toLowerCase().includes("minor") && typeof value === "number") return <td key={key} className="align-right"><strong>{formatCurrencyMinor(value, typeof row.currency === "string" ? row.currency : "MNT")}</strong></td>;
    return <td key={key}>{scalar(value)}</td>;
  })}</tr>)}</tbody></table>{filtered.length === 0 ? <div className="data-table__empty">Илэрц олдсонгүй</div> : null}</div></section>;
}

