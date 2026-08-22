import type { Metadata } from "next";
import { TourExplorer } from "@/components/tour-explorer";
import { getTours } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerI18n(); return { title: t("nav.publicTours"), description: t("public.toursDescription") }; }

export default async function ToursPage() { const tours = await getTours(); const { t } = await getServerI18n(); return <main><header className="page-hero"><div><h1>{t("public.findNextTrip")}</h1><p>{t("public.toursDescription")}</p></div></header><div className="page-container"><TourExplorer tours={tours} /></div></main>; }
