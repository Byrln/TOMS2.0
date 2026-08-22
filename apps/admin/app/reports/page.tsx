import { AdminRouteFrame } from "@/components/admin-route-frame";
import { DashboardSection } from "@/components/dashboard-section";

export default function ReportsPage() {
  return <AdminRouteFrame activePath="/reports" titleKey="page.reports.title" descriptionKey="page.reports.description"><DashboardSection /></AdminRouteFrame>;
}
