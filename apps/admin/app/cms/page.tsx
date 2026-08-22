import { AdminRouteFrame } from "@/components/admin-route-frame";
import { CmsWorkspace } from "@/components/workspace-sections";

export default function CmsPage() {
  return <AdminRouteFrame activePath="/cms" titleKey="page.cms.title" descriptionKey="page.cms.description"><CmsWorkspace /></AdminRouteFrame>;
}
