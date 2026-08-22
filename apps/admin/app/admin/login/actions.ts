"use server";

import { redirect } from "next/navigation";
import { staffIdentityFromClaims } from "@toms/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { getServerI18n } from "@/lib/i18n";

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function loginError(message: string): never {
  redirect(`/admin/login?error=${encodeURIComponent(message)}`);
}

export async function signInStaff(formData: FormData) {
  const { t } = await getServerI18n();
  const email = field(formData, "email");
  const password = field(formData, "password");
  const supabase = await createAdminSupabaseClient();
  if (!supabase) loginError(t("auth.configurationMissing"));

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) loginError(t("auth.invalidCredentials"));

  const { data, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !data?.claims) {
    await supabase.auth.signOut();
    loginError(t("auth.verifyFailed"));
  }

  let identity;
  try {
    identity = staffIdentityFromClaims(data.claims);
  } catch {
    await supabase.auth.signOut();
    loginError(t("auth.claimsMissing"));
  }

  const { data: membership, error: membershipError } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, role, status")
    .eq("tenant_id", identity.tenantId)
    .eq("user_id", identity.userId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (membershipError || !membership || membership.role !== identity.role) {
    await supabase.auth.signOut();
    loginError(t("auth.membershipMissing"));
  }

  redirect("/");
}

export async function sendStaffRecovery(formData: FormData) {
  const email = field(formData, "email");
  const supabase = await createAdminSupabaseClient();
  if (supabase) {
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/admin/auth/callback?next=/admin/reset-password`
    });
  }
  redirect("/admin/forgot-password?sent=1");
}

export async function resetStaffPassword(formData: FormData) {
  const { t } = await getServerI18n();
  const password = field(formData, "password");
  const confirmation = field(formData, "confirmation");
  if (password.length < 12 || password !== confirmation) {
    redirect(`/admin/reset-password?error=${encodeURIComponent(t("auth.passwordValidation"))}`);
  }
  const supabase = await createAdminSupabaseClient();
  if (!supabase) redirect("/admin/login?error=configuration");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/admin/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/admin/login?reset=1");
}
