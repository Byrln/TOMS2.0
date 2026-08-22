import { AdminRouteFrame } from "@/components/admin-route-frame";
import { DocumentsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function DocumentsPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/documents");
  return <AdminRouteFrame activePath="/documents" titleKey="page.documents.title" descriptionKey="page.documents.description"><DocumentsTable rows={result.data} /></AdminRouteFrame>;
}
