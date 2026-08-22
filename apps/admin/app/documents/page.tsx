import { AdminRouteFrame } from "@/components/admin-route-frame";
import { DocumentsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/documents?page=1&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/documents" titleKey="page.documents.title" descriptionKey="page.documents.description"><DocumentsTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
