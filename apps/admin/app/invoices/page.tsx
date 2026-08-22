import { AdminRouteFrame } from "@/components/admin-route-frame";
import { InvoicesTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/invoices?page=1&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/invoices" titleKey="page.invoices.title" descriptionKey="page.invoices.description"><InvoicesTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
