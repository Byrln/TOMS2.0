export const tomsTokens = {
  color: {
    midnight: "#071d35",
    navy: "#0b294a",
    blue: "#123d70",
    slate: "#58677a",
    ivory: "#f7f6f2",
    white: "#ffffff",
    gold: "#d4a537",
    goldDark: "#81570c",
    border: "#e4e8ee",
    success: "#198754",
    warning: "#b7791f",
    danger: "#c43d3d",
    info: "#2463a6"
  },
  radius: { small: "6px", medium: "10px", large: "14px" },
  shadow: { surface: "0 8px 28px rgba(7, 29, 53, 0.07)" }
} as const;

export type AdminNavItem = { label: string; href: string; icon: string; group: "WORK" | "COMMERCE" | "SYSTEM" };

export const adminNavigation: ReadonlyArray<AdminNavItem> = [
  { label: "Хяналтын самбар", href: "/", icon: "LayoutDashboard", group: "WORK" },
  { label: "Аяллууд", href: "/tours", icon: "Map", group: "WORK" },
  { label: "Хуваарьт гаралтууд", href: "/departures", icon: "PlaneTakeoff", group: "WORK" },
  { label: "Захиалгууд", href: "/bookings", icon: "ClipboardList", group: "WORK" },
  { label: "Аялагчид", href: "/travelers", icon: "Users", group: "WORK" },
  { label: "Харилцагчид", href: "/customers", icon: "Contact", group: "WORK" },
  { label: "Харилцааны төв", href: "/conversations", icon: "MessagesSquare", group: "WORK" },
  { label: "Үйл ажиллагаа", href: "/operations", icon: "Route", group: "WORK" },
  { label: "Manifest", href: "/manifest", icon: "ListChecks", group: "WORK" },
  { label: "Төлбөр", href: "/payments", icon: "CreditCard", group: "COMMERCE" },
  { label: "Нэхэмжлэл", href: "/invoices", icon: "ReceiptText", group: "COMMERCE" },
  { label: "Баримт бичиг", href: "/documents", icon: "Files", group: "COMMERCE" },
  { label: "Дэлгүүр / Storefront", href: "/storefront", icon: "Store", group: "COMMERCE" },
  { label: "CMS", href: "/cms", icon: "PanelsTopLeft", group: "COMMERCE" },
  { label: "Урамшуулал", href: "/promotions", icon: "BadgePercent", group: "COMMERCE" },
  { label: "Тайлан", href: "/reports", icon: "ChartNoAxesCombined", group: "SYSTEM" },
  { label: "Тохиргоо", href: "/settings", icon: "Settings", group: "SYSTEM" }
];

export function formatCurrencyMinor(amountMinor: number, currency = "MNT", locale = "mn-MN"): string {
  if (currency === "MNT") {
    return `₮ ${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amountMinor)}`;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2
  }).format(amountMinor / 100);
}
