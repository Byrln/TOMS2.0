import { AdminRouteFrame } from "@/components/admin-route-frame";
import { TravelersTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function TravelersPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/travelers");
  return <AdminRouteFrame activePath="/travelers" titleKey="page.travelers.title" descriptionKey="page.travelers.description"><TravelersTable rows={result.data} /></AdminRouteFrame>;
}
