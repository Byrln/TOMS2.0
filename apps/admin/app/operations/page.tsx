import { AdminRouteFrame } from "@/components/admin-route-frame";
import { DeparturesTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function OperationsPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/departures");
  return <AdminRouteFrame activePath="/operations" titleKey="page.operations.title" descriptionKey="page.operations.description"><DeparturesTable rows={result.data} /></AdminRouteFrame>;
}
