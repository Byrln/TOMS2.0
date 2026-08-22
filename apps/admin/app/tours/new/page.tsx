import { AdminShell, PageHeader } from "@toms/admin-ui";
import { TourForm } from "@/components/tour-form";
import { getServerI18n } from "@/lib/i18n";
export default async function NewTourPage(){const { t }=await getServerI18n();return <AdminShell activePath="/tours"><PageHeader eyebrow={t("admin.product")} title={t("action.newTour")} description={t("admin.newTourDescription")} /><TourForm /></AdminShell>}
