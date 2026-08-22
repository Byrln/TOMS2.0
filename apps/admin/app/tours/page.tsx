import { AdminRouteFrame } from "@/components/admin-route-frame";
import { ToursTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function ToursPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/tours");
  return <AdminRouteFrame activePath="/tours" titleKey="page.tours.title" descriptionKey="page.tours.description" actionKey="action.newTour" actionHref="/tours/new"><ToursTable rows={result.data} /></AdminRouteFrame>;
}
