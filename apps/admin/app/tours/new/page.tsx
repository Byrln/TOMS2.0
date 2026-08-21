import { AdminShell, PageHeader } from "@toms/admin-ui";
import { TourForm } from "@/components/tour-form";
export default function NewTourPage(){return <AdminShell activePath="/tours"><PageHeader eyebrow="Product" title="Шинэ аялал" description="Reusable tour product, үнэ ба storefront контентыг үүсгэнэ." /><TourForm /></AdminShell>}
