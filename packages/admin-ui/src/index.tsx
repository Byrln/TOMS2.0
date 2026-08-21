import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgePercent,
  ChartNoAxesCombined,
  ClipboardList,
  Contact,
  CreditCard,
  Files,
  LayoutDashboard,
  ListChecks,
  Map,
  Menu,
  MessagesSquare,
  PanelsTopLeft,
  PlaneTakeoff,
  ReceiptText,
  Route,
  Search,
  Settings,
  Store,
  Users
} from "lucide-react";
import { adminNavigation } from "@toms/config";

const iconMap = {
  BadgePercent,
  ChartNoAxesCombined,
  ClipboardList,
  Contact,
  CreditCard,
  Files,
  LayoutDashboard,
  ListChecks,
  Map,
  MessagesSquare,
  PanelsTopLeft,
  PlaneTakeoff,
  ReceiptText,
  Route,
  Settings,
  Store,
  Users
} as const;

export function TomsMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="toms-mark" aria-label="TOMS">
      <span className="toms-mark__icon" aria-hidden="true">✦</span>
      {compact ? null : <span className="toms-mark__word">TOMS</span>}
    </span>
  );
}

export function AdminShell({ activePath, children }: { activePath: string; children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><TomsMark /><Menu size={16} aria-hidden="true" /></div>
        <nav aria-label="Үндсэн цэс">
          {adminNavigation.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
            const selected = activePath === item.href || (item.href !== "/" && activePath.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href} className={`admin-nav__item${selected ? " is-active" : ""}`} aria-current={selected ? "page" : undefined}>
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar__tenant"><span>MD</span><div><strong>Munkh Discovery</strong><small>Demo tenant</small></div></div>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-search"><Search size={15} aria-hidden="true" /><span>Хайлт хийх...</span><kbd>⌘ K</kbd></div>
          <div className="admin-topbar__actions"><span className="sync-dot">●</span><span>Саруул Эрдэнэ</span><span className="avatar">СЭ</span></div>
        </header>
        <main className="admin-content">{children}</main>
      </section>
    </div>
  );
}

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";
export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  return <span className={`status-badge status-badge--${tone}`}><span aria-hidden="true" className="status-badge__dot" />{children}</span>;
}

export function MetricCard({ label, value, change, tone = "success" }: { label: string; value: string; change?: string; tone?: StatusTone }) {
  return <article className="metric-card"><p>{label}</p><strong>{value}</strong>{change ? <StatusBadge tone={tone}>{change}</StatusBadge> : null}</article>;
}

export type DataColumn = { key: string; label: string; align?: "left" | "right"; render?: (row: Record<string, unknown>) => ReactNode };
export function DataTable({ columns, rows, emptyLabel = "Мэдээлэл олдсонгүй" }: { columns: ReadonlyArray<DataColumn>; rows: ReadonlyArray<Record<string, unknown>>; emptyLabel?: string }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.key} className={column.align === "right" ? "align-right" : undefined}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="data-table__empty">{emptyLabel}</td></tr> : rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>{columns.map((column) => <td key={column.key} className={column.align === "right" ? "align-right" : undefined}>{column.render ? column.render(row) : String(row[column.key] ?? "—")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageHeader({ title, eyebrow, description, actions }: { title: string; eyebrow?: string; description?: string; actions?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}<h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{actions ? <div className="page-header__actions">{actions}</div> : null}</div>;
}

export function Button({ children, variant = "primary", type = "button" }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost"; type?: "button" | "submit" }) {
  return <button type={type} className={`button button--${variant}`}>{children}</button>;
}

