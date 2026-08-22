import { AdminRouteFrame } from "@/components/admin-route-frame";
import { ConversationsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function ConversationsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/conversations?page=1&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/conversations" titleKey="page.conversations.title" descriptionKey="page.conversations.description"><ConversationsTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
