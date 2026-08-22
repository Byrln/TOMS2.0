import { AdminRouteFrame } from "@/components/admin-route-frame";
import { DeparturesTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function DeparturesPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/departures");
  return <AdminRouteFrame activePath="/departures" titleKey="page.departures.title" descriptionKey="page.departures.description" actionKey="action.newDeparture" actionHref="/departures/new"><DeparturesTable rows={result.data} /></AdminRouteFrame>;
}
