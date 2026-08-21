import type { Metadata } from "next";
import { StorefrontFooter, StorefrontHeader } from "@toms/storefront-ui";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001"),
  title: { default: "Munkh Discovery — TOMS", template: "%s | Munkh Discovery" },
  description: "Монгол болон дэлхийн шилдэг олон өдрийн аяллууд.",
  openGraph: { title: "Munkh Discovery", description: "Дэлхийг өөрийнхөөрөө мэдэр.", type: "website", locale: "mn_MN" },
  twitter: { card: "summary_large_image" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn" data-scroll-behavior="smooth"><body><Providers><StorefrontHeader />{children}<StorefrontFooter /></Providers></body></html>;
}
