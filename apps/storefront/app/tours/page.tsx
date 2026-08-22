import type { Metadata } from "next";
import { TourExplorer } from "@/components/tour-explorer";
import { getTours } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerI18n(); return { title: t("nav.publicTours"), description: t("public.toursDescription") }; }

export default async function ToursPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) { const filters = await searchParams; const q = filters.q ?? ""; const tours = await getTours(`page=${filters.page ?? "1"}&pageSize=12&q=${encodeURIComponent(q)}`); const { t } = await getServerI18n(); return <main><header className="page-hero page-hero--catalog"><div><p className="section-eyebrow">THE JOURNEY COLLECTION</p><h1>{t("public.findNextTrip")}</h1><p>{t("public.toursDescription")}</p></div></header><div className="page-container catalog-container"><TourExplorer data={tours} query={q} /></div></main>; }
