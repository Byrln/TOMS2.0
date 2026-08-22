import { AdminRouteFrame } from "@/components/admin-route-frame";
import { PromotionsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/promotions?page=1&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/promotions" titleKey="page.promotions.title" descriptionKey="page.promotions.description"><PromotionsTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
