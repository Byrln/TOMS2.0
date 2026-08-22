import type { Metadata } from "next";
import { cookies } from "next/headers";
import { localeCookieName, normalizeLocale } from "@toms/i18n";
import { LocaleProvider } from "@toms/i18n/react";
import { getServerI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });


export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return { title: { default: `TOMS — ${t("app.admin")}`, template: "%s | TOMS" }, description: t("page.dashboard.description"), robots: { index: false, follow: false } };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookieName)?.value);
  return <html lang={locale} className={cn(geist.variable)}><body suppressHydrationWarning><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></body></html>;
}
