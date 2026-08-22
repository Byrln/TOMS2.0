import { AdminRouteFrame } from "@/components/admin-route-frame";
import { PaymentsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/payments?page=1&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/payments" titleKey="page.payments.title" descriptionKey="page.payments.description"><PaymentsTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
