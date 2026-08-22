import { AdminRouteFrame } from "@/components/admin-route-frame";
import { PromotionsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function PromotionsPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/promotions");
  return <AdminRouteFrame activePath="/promotions" titleKey="page.promotions.title" descriptionKey="page.promotions.description"><PromotionsTable rows={result.data} /></AdminRouteFrame>;
}
