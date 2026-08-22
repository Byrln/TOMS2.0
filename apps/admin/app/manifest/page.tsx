import { AdminRouteFrame } from "@/components/admin-route-frame";
import { TravelersTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function ManifestPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/travelers");
  return <AdminRouteFrame activePath="/manifest" titleKey="page.manifest.title" descriptionKey="page.manifest.description"><TravelersTable rows={result.data} /></AdminRouteFrame>;
}
