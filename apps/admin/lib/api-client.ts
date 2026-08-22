"use client";

import { createBrowserClient } from "@supabase/ssr";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
let client: ReturnType<typeof createBrowserClient> | undefined;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase browser configuration is missing");
  client ??= createBrowserClient(url, publishableKey);
  return client;
}

export async function adminApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error || !data.session?.access_token) throw new Error("An authenticated staff session is required");
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${data.session.access_token}`);
  return fetch(`${apiUrl}${path}`, { ...init, headers });
}
