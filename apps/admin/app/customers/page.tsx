import { AdminRouteFrame } from "@/components/admin-route-frame";
import { CustomersTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/customers?page=1&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/customers" titleKey="page.customers.title" descriptionKey="page.customers.description"><CustomersTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
