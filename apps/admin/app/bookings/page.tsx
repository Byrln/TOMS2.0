import { AdminRouteFrame } from "@/components/admin-route-frame";
import { BookingsTable } from "@/components/backoffice-tables";
import { getAdminJson } from "@/lib/api";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const filters = await searchParams; const q = filters.q?.trim() ?? ""; const currentPage = Number(filters.page ?? 1);
  const result = await getAdminJson<{ items: Record<string, unknown>[]; page: { total: number } }>(`/api/v1/admin/bookings?page=${currentPage}&pageSize=25&q=${encodeURIComponent(q)}`);
  return <AdminRouteFrame activePath="/bookings" titleKey="page.bookings.title" descriptionKey="page.bookings.description"><BookingsTable rows={result.items} query={q} total={result.page.total} /></AdminRouteFrame>;
}
