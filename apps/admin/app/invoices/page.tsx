import { AdminRouteFrame } from "@/components/admin-route-frame";
import { InvoicesTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function InvoicesPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/invoices");
  return <AdminRouteFrame activePath="/invoices" titleKey="page.invoices.title" descriptionKey="page.invoices.description"><InvoicesTable rows={result.data} /></AdminRouteFrame>;
}
