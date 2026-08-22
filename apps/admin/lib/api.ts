import { createAdminSupabaseClient } from "./supabase-server";
import { getServerI18n } from "./i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getAdminJson<T>(path: string): Promise<T> {
  const { locale } = await getServerI18n();
  if (process.env.TOMS_DEMO_MODE === "1") {
    const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", headers: { authorization: "Bearer toms-demo-access-token", "x-toms-locale": locale } });
    if (!response.ok) throw new Error(`TOMS API ${response.status}`);
    return response.json() as Promise<T>;
  }
  const supabase = await createAdminSupabaseClient();
  if (!supabase) throw new Error("Supabase server configuration is missing");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("An authenticated staff session is required");
  const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", headers: { authorization: `Bearer ${data.session.access_token}`, "x-toms-locale": locale } });
  if (!response.ok) throw new Error(`TOMS API ${response.status}`);
  return response.json() as Promise<T>;
}
