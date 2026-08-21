import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin-page";
import { moduleDefinitions } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const path = slug.length === 0 ? "/" : `/${slug.join("/")}`;
  const definition = moduleDefinitions[path];
  if (!definition) notFound();
  return <AdminPage path={path} definition={definition} />;
}
