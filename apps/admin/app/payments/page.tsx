import { AdminRouteFrame } from "@/components/admin-route-frame";
import { PaymentsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function PaymentsPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/payments");
  return <AdminRouteFrame activePath="/payments" titleKey="page.payments.title" descriptionKey="page.payments.description"><PaymentsTable rows={result.data} /></AdminRouteFrame>;
}
