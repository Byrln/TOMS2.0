import { NextResponse } from "next/server";
import { createTravelerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/account/trips";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/account/trips";
  const bookingId = url.searchParams.get("booking");
  const supabase = await createTravelerSupabaseClient();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (bookingId) await supabase.rpc("claim_booking", { target_booking: bookingId });
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=Magic+link+хүчингүй+эсвэл+хугацаа+дууссан.", url.origin));
}
