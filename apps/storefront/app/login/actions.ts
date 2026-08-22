"use server";

import { redirect } from "next/navigation";
import { createTravelerSupabaseClient } from "@/lib/supabase-server";

function value(formData: FormData, key: string) {
  const result = formData.get(key);
  return typeof result === "string" ? result.trim() : "";
}

export async function requestTripClaim(formData: FormData) {
  const email = value(formData, "email");
  const bookingId = value(formData, "bookingId");
  const supabase = await createTravelerSupabaseClient();
  if (!supabase) redirect("/login?error=configuration");

  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001";
  const next = bookingId ? `/account/trips/${encodeURIComponent(bookingId)}` : "/account/trips";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}${bookingId ? `&booking=${encodeURIComponent(bookingId)}` : ""}`
    }
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}
