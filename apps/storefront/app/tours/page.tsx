import type { Metadata } from "next";
import { TourExplorer } from "@/components/tour-explorer";
import { getTours } from "@/lib/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Аяллууд", description: "Баталгаатай олон өдрийн аяллын жагсаалт." };

export default async function ToursPage() { const tours = await getTours(); return <main><header className="page-hero"><div><h1>Дараагийн аяллаа ол</h1><p>Огноо, үнэ, багтаамж нь нэг эх сурвалжаас шинэчлэгдсэн олон өдрийн аяллууд.</p></div></header><div className="page-container"><TourExplorer tours={tours} /></div></main>; }

