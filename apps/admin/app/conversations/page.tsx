import { AdminRouteFrame } from "@/components/admin-route-frame";
import { ConversationsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function ConversationsPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/conversations");
  return <AdminRouteFrame activePath="/conversations" titleKey="page.conversations.title" descriptionKey="page.conversations.description"><ConversationsTable rows={result.data} /></AdminRouteFrame>;
}
