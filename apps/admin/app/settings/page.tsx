import { AdminRouteFrame } from "@/components/admin-route-frame";
import { SettingsWorkspace } from "@/components/workspace-sections";

export default function SettingsPage() {
  return <AdminRouteFrame activePath="/settings" titleKey="page.settings.title" descriptionKey="page.settings.description"><SettingsWorkspace /></AdminRouteFrame>;
}
