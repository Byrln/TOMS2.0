import { AdminShell, PageHeader } from "@toms/admin-ui";
import { DepartureForm } from "@/components/departure-form";
import { getAdminJson } from "@/lib/api";
import { getServerI18n } from "@/lib/i18n";
export const dynamic="force-dynamic";
export default async function NewDeparturePage({searchParams}:{searchParams:Promise<{tourId?:string}>}){const {tourId}=await searchParams;const { t }=await getServerI18n();const result=await getAdminJson<{data:Array<{id:string;name:string}>}>("/api/v1/admin/tours");const tours=result.data.map((tour)=>({id:tour.id,name:tour.name}));return <AdminShell activePath="/departures"><PageHeader eyebrow={t("admin.inventory")} title={t("action.newDeparture")} description={t("admin.newDepartureDescription")} /><DepartureForm tours={tours} {...(tourId?{selectedTourId:tourId}:{})} /></AdminShell>}
