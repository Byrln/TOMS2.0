"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BadgePercent,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Command,
  Contact,
  CreditCard,
  Files,
  LayoutDashboard,
  ListChecks,
  Map,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  PlaneTakeoff,
  ReceiptText,
  Route,
  Search,
  Settings,
  Store,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import { useLocale } from "@toms/i18n/react";
import type { TranslationKey } from "@toms/i18n";

type SidebarItem = {
  id: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  href?: string;
  action?: "search";
  children?: ReadonlyArray<SidebarItem>;
};

type SidebarGroup = {
  headingKey?: TranslationKey;
  items: ReadonlyArray<SidebarItem>;
};

const dashboardItem: SidebarItem = { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, href: "/" };

const sidebarGroups: ReadonlyArray<SidebarGroup> = [
  {
    items: [
      { id: "search", labelKey: "common.search", icon: Search, action: "search" },
      dashboardItem,
      { id: "bookings", labelKey: "nav.bookings", icon: ClipboardList, href: "/bookings" },
      { id: "reports", labelKey: "nav.reports", icon: ChartNoAxesCombined, href: "/reports" },
    ],
  },
  {
    headingKey: "nav.tours",
    items: [
      { id: "tours", labelKey: "nav.tours", icon: Map, href: "/tours" },
      { id: "departures", labelKey: "nav.departures", icon: PlaneTakeoff, href: "/departures" },
    ],
  },
  {
    headingKey: "nav.customers",
    items: [
      {
        id: "crm",
        labelKey: "nav.crm",
        icon: MessagesSquare,
        children: [
          { id: "travelers", labelKey: "nav.travelers", icon: Users, href: "/travelers" },
          { id: "customers", labelKey: "nav.customers", icon: Contact, href: "/customers" },
          { id: "conversations", labelKey: "nav.crm", icon: MessagesSquare, href: "/conversations" },
        ],
      },
    ],
  },
  {
    headingKey: "nav.operations",
    items: [
      { id: "operations", labelKey: "nav.operations", icon: Route, href: "/operations" },
      { id: "manifest", labelKey: "nav.manifest", icon: ListChecks, href: "/manifest" },
      { id: "documents", labelKey: "nav.documents", icon: Files, href: "/documents" },
    ],
  },
  {
    headingKey: "nav.finance",
    items: [
      { id: "payments", labelKey: "nav.payments", icon: CreditCard, href: "/payments" },
      { id: "invoices", labelKey: "nav.invoices", icon: ReceiptText, href: "/invoices" },
      { id: "promotions", labelKey: "nav.promotions", icon: BadgePercent, href: "/promotions" },
    ],
  },
  {
    headingKey: "nav.settings",
    items: [
      { id: "storefront", labelKey: "nav.storefront", icon: Store, href: "/storefront" },
      { id: "cms", labelKey: "nav.cms", icon: PanelsTopLeft, href: "/cms" },
    ],
  },
];

function matchesActivePath(href: string, activePath: string) {
  return activePath === href || (href !== "/" && activePath.startsWith(`${href}/`));
}

function isActiveNavigationItem(item: SidebarItem, activePath: string): boolean {
  return Boolean((item.href && matchesActivePath(item.href, activePath)) || item.children?.some((child) => isActiveNavigationItem(child, activePath)));
}

function findActiveNavigationItem(items: ReadonlyArray<SidebarItem>, activePath: string): SidebarItem | undefined {
  for (const item of items) {
    if (item.href && matchesActivePath(item.href, activePath)) return item;
    const activeChild = item.children && findActiveNavigationItem(item.children, activePath);
    if (activeChild) return activeChild;
  }
}

function SidebarNavItem({ item, activePath, onSearch, level = 0 }: { item: SidebarItem; activePath: string; onSearch: () => void; level?: number }) {
  const { t } = useLocale();
  const hasChildren = Boolean(item.children?.length);
  const isActive = isActiveNavigationItem(item, activePath);
  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = item.icon;

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const itemContent = <><Icon size={16} strokeWidth={1.6} aria-hidden="true" /><span>{t(item.labelKey)}</span></>;

  return (
    <div className="admin-sidebar__nav-entry">
      <div className={`admin-sidebar__nav-item${isActive ? " is-active" : ""}`} style={{ paddingLeft: `${level * 12 + 10}px` }}>
        {item.href ? (
          <Link href={item.href} aria-label={t(item.labelKey)} aria-current={matchesActivePath(item.href, activePath) ? "page" : undefined}>{itemContent}</Link>
        ) : (
          <button type="button" aria-label={t(item.labelKey)} onClick={() => item.action === "search" ? onSearch() : setIsOpen((open) => !open)}>{itemContent}</button>
        )}
        {hasChildren ? <button type="button" className="admin-sidebar__submenu-toggle" aria-label={t(item.labelKey)} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}><ChevronRight size={14} aria-hidden="true" /></button> : null}
      </div>
      {hasChildren ? (
        <div className={`admin-sidebar__subnav${isOpen ? " is-open" : ""}`}>
          <div>{item.children?.map((child) => <SidebarNavItem key={child.id} item={child} activePath={activePath} onSearch={onSearch} level={level + 1} />)}</div>
        </div>
      ) : null}
    </div>
  );
}

export function TomsMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="toms-mark" aria-label="TOMS">
      <span className="toms-mark__icon" aria-hidden="true">✦</span>
      {compact ? null : <span className="toms-mark__word">TOMS</span>}
    </span>
  );
}

export function AdminShell({ activePath, children, initialSidebarOpen = true }: { activePath: string; children: ReactNode; initialSidebarOpen?: boolean }) {
  const { t } = useLocale();
  const [isSidebarOpen, setIsSidebarOpen] = useState(initialSidebarOpen);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const activeItem = findActiveNavigationItem(sidebarGroups.flatMap((group) => group.items), activePath) ?? dashboardItem;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`admin-shell${isSidebarOpen ? "" : " is-sidebar-collapsed"}`}>
      <aside className={`admin-sidebar${isSidebarOpen ? "" : " is-collapsed"}`}>
        <div className="admin-sidebar__workspace-switcher">
          <TomsMark compact />
          <span><strong>Munkh Discovery</strong><small>{t("common.activeWorkspace")}</small></span>
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <nav className="admin-sidebar__navigation" aria-label={t("common.mainNavigation")}>
          {sidebarGroups.map((group) => (
            <div className="admin-sidebar__group" key={group.headingKey ?? "primary"}>
              {group.headingKey ? <span>{t(group.headingKey)}</span> : null}
              {group.items.map((item) => <SidebarNavItem key={item.id} item={item} activePath={activePath} onSearch={() => setIsSearchOpen(true)} />)}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <SidebarNavItem item={{ id: "settings", labelKey: "nav.settings", icon: Settings, href: "/settings" }} activePath={activePath} onSearch={() => setIsSearchOpen(true)} />
        </div>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar__start">
            <button type="button" className="admin-shell__menu-toggle" aria-label={isSidebarOpen ? t("common.close") : t("common.open")} onClick={() => setIsSidebarOpen((open) => !open)}>{isSidebarOpen ? <PanelLeftClose size={18} strokeWidth={1.5} aria-hidden="true" /> : <PanelLeftOpen size={18} strokeWidth={1.5} aria-hidden="true" />}</button>
            <div className="admin-topbar__breadcrumb"><span>Munkh Discovery</span><i aria-hidden="true">/</i><strong>{t(activeItem.labelKey)}</strong></div>
          </div>
          <div className="admin-topbar__actions">
            <button type="button" className="admin-search" onClick={() => setIsSearchOpen(true)}><Search size={15} aria-hidden="true" /><span>{t("common.searchPlaceholder")}</span><kbd>⌘ K</kbd></button>
            <LocaleSwitcher />
            <span className="sync-dot">●</span><span>Саруул Эрдэнэ</span><span className="avatar">СЭ</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </section>
      {isSearchOpen ? <div className="admin-command" role="dialog" aria-modal="true" aria-label={t("common.search")}><button type="button" className="admin-command__backdrop" aria-label={t("common.close")} onClick={() => setIsSearchOpen(false)} /><div className="admin-command__panel"><div><Search size={18} strokeWidth={1.5} aria-hidden="true" /><input autoFocus placeholder={t("common.searchPlaceholder")} aria-label={t("common.search")} /><button type="button" aria-label={t("common.close")} onClick={() => setIsSearchOpen(false)}><X size={18} aria-hidden="true" /></button></div><p><Command size={20} strokeWidth={1.5} aria-hidden="true" />{t("common.search")}</p></div></div> : null}
    </div>
  );
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="locale-switcher" role="group" aria-label={t("language.label")}>
      <button type="button" aria-pressed={locale === "mn"} aria-label={t("language.switchToMn")} onClick={() => setLocale("mn")}>MN</button>
      <button type="button" aria-pressed={locale === "en"} aria-label={t("language.switchToEn")} onClick={() => setLocale("en")}>EN</button>
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
export function DataTable({ columns, rows, emptyLabel }: { columns: ReadonlyArray<DataColumn>; rows: ReadonlyArray<Record<string, unknown>>; emptyLabel?: string }) {
  const { t } = useLocale();
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.key} className={column.align === "right" ? "align-right" : undefined}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="data-table__empty">{emptyLabel ?? t("state.empty")}</td></tr> : rows.map((row, index) => (
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
