import { AdminRouteFrame } from "@/components/admin-route-frame";
import { DashboardSection } from "@/components/dashboard-section";

export default function DashboardPage() {
  return <AdminRouteFrame activePath="/" titleKey="page.dashboard.title" descriptionKey="page.dashboard.description"><DashboardSection /></AdminRouteFrame>;
}
