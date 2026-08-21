import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TOMS Admin", template: "%s | TOMS" },
  description: "Travel Operations OS for multi-day travel companies",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}

