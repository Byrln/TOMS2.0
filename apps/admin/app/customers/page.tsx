import { AdminRouteFrame } from "@/components/admin-route-frame";
import { CustomersTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function CustomersPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/customers");
  return <AdminRouteFrame activePath="/customers" titleKey="page.customers.title" descriptionKey="page.customers.description"><CustomersTable rows={result.data} /></AdminRouteFrame>;
}
