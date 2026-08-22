import { redirect } from "next/navigation";
export default async function LegacyTripPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/account/trips/${id}`); }
