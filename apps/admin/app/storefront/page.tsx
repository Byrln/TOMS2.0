import { AdminRouteFrame } from "@/components/admin-route-frame";
import { StorefrontWorkspace } from "@/components/workspace-sections";

export default function StorefrontPage() {
  return <AdminRouteFrame activePath="/storefront" titleKey="page.storefront.title" descriptionKey="page.storefront.description"><StorefrontWorkspace /></AdminRouteFrame>;
}
