import { redirect } from "next/navigation";
export default async function LegacyConfirmationPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/booking/confirmation/${id}`); }
