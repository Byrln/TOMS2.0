"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BadgePercent, ChartNoAxesCombined, ClipboardList, Contact, CreditCard, Files,
  LayoutDashboard, ListChecks, Map, MessagesSquare, PanelLeftClose, PanelLeftOpen,
  PanelsTopLeft, PlaneTakeoff, ReceiptText, Route, Search, Settings, Store, Users,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@toms/i18n/react";
import type { TranslationKey } from "@toms/i18n";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

type NavItem = { label: TranslationKey; icon: LucideIcon; href: string };
const groups: Array<{ label?: TranslationKey; items: NavItem[] }> = [
  { items: [{ label: "nav.dashboard", icon: LayoutDashboard, href: "/" }, { label: "nav.bookings", icon: ClipboardList, href: "/bookings" }, { label: "nav.reports", icon: ChartNoAxesCombined, href: "/reports" }] },
  { label: "nav.tours", items: [{ label: "nav.tours", icon: Map, href: "/tours" }, { label: "nav.departures", icon: PlaneTakeoff, href: "/departures" }] },
  { label: "nav.customers", items: [{ label: "nav.travelers", icon: Users, href: "/travelers" }, { label: "nav.customers", icon: Contact, href: "/customers" }, { label: "nav.crm", icon: MessagesSquare, href: "/conversations" }] },
  { label: "nav.operations", items: [{ label: "nav.operations", icon: Route, href: "/operations" }, { label: "nav.manifest", icon: ListChecks, href: "/manifest" }, { label: "nav.documents", icon: Files, href: "/documents" }] },
  { label: "nav.finance", items: [{ label: "nav.payments", icon: CreditCard, href: "/payments" }, { label: "nav.invoices", icon: ReceiptText, href: "/invoices" }, { label: "nav.promotions", icon: BadgePercent, href: "/promotions" }] },
  { label: "nav.settings", items: [{ label: "nav.storefront", icon: Store, href: "/storefront" }, { label: "nav.cms", icon: PanelsTopLeft, href: "/cms" }, { label: "nav.settings", icon: Settings, href: "/settings" }] },
];

const active = (href: string, path: string) => href === path || (href !== "/" && path.startsWith(`${href}/`));

export function TomsMark({ compact = false }: { compact?: boolean }) {
  return <span className="toms-mark" aria-label="TOMS"><span className="toms-mark__icon" aria-hidden="true">✦</span>{compact ? null : <span className="toms-mark__word">TOMS</span>}</span>;
}

function Navigation({ activePath }: { activePath: string }) {
  const { t } = useLocale();
  return <ScrollArea className="admin-sidebar__navigation"><nav aria-label={t("common.mainNavigation")}>
    {groups.map((group, index) => <div className="admin-sidebar__group" key={group.label ?? `main-${index}`}>
      {group.label ? <span>{t(group.label)}</span> : null}
      {group.items.map(({ href, icon: Icon, label }) => <Button key={href} variant="ghost" className={`admin-nav-button${active(href, activePath) ? " is-active" : ""}`} render={<Link href={href} aria-label={t(label)} aria-current={active(href, activePath) ? "page" : undefined} />}><Icon aria-hidden="true" /> <span>{t(label)}</span></Button>)}
    </div>)}
  </nav></ScrollArea>;
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return <div className="locale-switcher" role="group" aria-label={t("language.label")}>
    <Button size="xs" variant={locale === "mn" ? "secondary" : "ghost"} aria-pressed={locale === "mn"} onClick={() => setLocale("mn")}>MN</Button>
    <Button size="xs" variant={locale === "en" ? "secondary" : "ghost"} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</Button>
  </div>;
}

export function AdminShell({ activePath, children, initialSidebarOpen = true }: { activePath: string; children: ReactNode; initialSidebarOpen?: boolean }) {
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const current = useMemo(() => groups.flatMap((group) => group.items).find((item) => active(item.href, activePath)), [activePath]);
  useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } }; window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut); }, []);
  return <div className={`admin-shell${sidebarOpen ? "" : " is-sidebar-collapsed"}`}>
    <aside className={`admin-sidebar${sidebarOpen ? "" : " is-collapsed"}`}><div className="admin-sidebar__workspace-switcher"><TomsMark compact /><span><strong>Munkh Discovery</strong><small>{t("common.activeWorkspace")}</small></span></div><Navigation activePath={activePath} /></aside>
    <section className="admin-workspace"><header className="admin-topbar"><div className="admin-topbar__start"><Button variant="ghost" size="icon" className="admin-shell__menu-toggle" aria-label={sidebarOpen ? t("common.close") : t("common.open")} onClick={() => setSidebarOpen((value) => !value)}>{sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}</Button><div className="admin-topbar__breadcrumb"><span>Munkh Discovery</span><i aria-hidden="true">/</i><strong>{current ? t(current.label) : "TOMS"}</strong></div></div><div className="admin-topbar__actions"><Button variant="outline" className="admin-search" onClick={() => setSearchOpen(true)}><Search /><span>{t("common.searchPlaceholder")}</span><kbd>⌘ K</kbd></Button><LocaleSwitcher /><span className="sync-dot" aria-label="Connected">●</span><span className="staff-name">Саруул Эрдэнэ</span><Avatar><AvatarFallback>СЭ</AvatarFallback></Avatar></div></header><main className="admin-content">{children}</main></section>
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent className="admin-command__panel"><DialogHeader><DialogTitle>{t("common.search")}</DialogTitle><DialogDescription>{t("common.searchPlaceholder")}</DialogDescription></DialogHeader><div className="admin-command__input"><Search aria-hidden="true" /><Input autoFocus placeholder={t("common.searchPlaceholder")} aria-label={t("common.search")} /></div></DialogContent></Dialog>
  </div>;
}

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";
export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) {
  const variant = tone === "danger" ? "destructive" : tone === "success" ? "default" : "secondary";
  return <Badge variant={variant} className={`status-badge status-badge--${tone}`}><span aria-hidden="true" className="status-badge__dot" />{children}</Badge>;
}
export function MetricCard({ label, value, change, tone = "success" }: { label: string; value: string; change?: string; tone?: StatusTone }) { return <Card className="metric-card"><CardContent><p>{label}</p><strong>{value}</strong>{change ? <StatusBadge tone={tone}>{change}</StatusBadge> : null}</CardContent></Card>; }
export type DataColumn = { key: string; label: string; align?: "left" | "right"; render?: (row: Record<string, unknown>) => ReactNode };
export function DataTable({ columns, rows, emptyLabel }: { columns: ReadonlyArray<DataColumn>; rows: ReadonlyArray<Record<string, unknown>>; emptyLabel?: string }) { const { t } = useLocale(); return <Table className="data-table"><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.key} className={column.align === "right" ? "align-right" : undefined}>{column.label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={columns.length} className="data-table__empty">{emptyLabel ?? t("state.empty")}</TableCell></TableRow> : rows.map((row, index) => <TableRow key={String(row.id ?? index)}>{columns.map((column) => <TableCell key={column.key} className={column.align === "right" ? "align-right" : undefined}>{column.render ? column.render(row) : String(row[column.key] ?? "—")}</TableCell>)}</TableRow>)}</TableBody></Table>; }
export function PageHeader({ title, eyebrow, description, actions }: { title: string; eyebrow?: string; description?: string; actions?: ReactNode }) { return <div className="page-header"><div>{eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}<h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{actions ? <div className="page-header__actions">{actions}</div> : null}</div>; }
