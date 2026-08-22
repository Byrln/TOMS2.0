import { AdminRouteFrame } from "@/components/admin-route-frame";
import { BookingsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function BookingsPage() {
  const result = await getAdminJson<{ data: Record<string, unknown>[] }>("/api/v1/admin/bookings");
  return <AdminRouteFrame activePath="/bookings" titleKey="page.bookings.title" descriptionKey="page.bookings.description"><BookingsTable rows={result.data} /></AdminRouteFrame>;
}
