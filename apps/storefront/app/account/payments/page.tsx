import { redirect } from "next/navigation";
import { getTravelerDashboard } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function AccountPaymentsPage() { const data = await getTravelerDashboard(); if (!data.currentTrip) redirect("/account"); redirect(`/account/trips/${data.currentTrip.booking.id}/payments`); }
