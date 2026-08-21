import { AdminShell, PageHeader } from "@toms/admin-ui";
import { DepartureForm } from "@/components/departure-form";
import { getAdminJson } from "@/lib/api";
export const dynamic="force-dynamic";
export default async function NewDeparturePage({searchParams}:{searchParams:Promise<{tourId?:string}>}){const {tourId}=await searchParams;const data=await getAdminJson<{items:Array<{id:string;name:string}>}>("/api/v1/admin/resources/tours");return <AdminShell activePath="/departures"><PageHeader eyebrow="Inventory" title="Шинэ хуваарьт гаралт" description="Огноо, багтаамж, үнэ бүхий бодит departure үүсгэнэ." /><DepartureForm tours={data.items} {...(tourId?{selectedTourId:tourId}:{})} /></AdminShell>}
