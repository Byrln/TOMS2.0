import type { Metadata } from "next";
import { cookies } from "next/headers";
import { StorefrontFooter, StorefrontHeader } from "@toms/storefront-ui";
import { localeCookieName, normalizeLocale } from "@toms/i18n";
import { LocaleProvider } from "@toms/i18n/react";
import { getServerI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Geist, Noto_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const display = Noto_Serif({ subsets: ["cyrillic", "latin"], variable: "--font-display" });


export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getServerI18n();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001"),
    title: { default: "Munkh Discovery — TOMS", template: "%s | Munkh Discovery" },
    description: t("public.heroDescription"),
    openGraph: { title: "Munkh Discovery", description: t("public.heroTitle"), type: "website", locale: locale === "en" ? "en_US" : "mn_MN" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(localeCookieName)?.value);
  return <html lang={locale} data-scroll-behavior="smooth" className={cn(geist.variable, display.variable)}><body suppressHydrationWarning><LocaleProvider initialLocale={locale}><Providers><StorefrontHeader />{children}<StorefrontFooter /></Providers></LocaleProvider></body></html>;
}
