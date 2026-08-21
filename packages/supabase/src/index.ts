import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const publicConfigSchema=z.object({
  NEXT_PUBLIC_SUPABASE_URL:z.url().refine((url)=>url.startsWith("https://"),"Supabase URL must use HTTPS"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:z.string().startsWith("sb_publishable_")
});
const serverConfigSchema=publicConfigSchema.extend({SUPABASE_SECRET_KEY:z.string().min(24).refine((key)=>!key.startsWith("sb_publishable_"),"Server secret cannot be a publishable key")});

export type PublicSupabaseConfig={url:string;publishableKey:string};
export type ServerSupabaseConfig=PublicSupabaseConfig&{secretKey:string};

export function parsePublicSupabaseConfig(environment:Record<string,string|undefined>):PublicSupabaseConfig{
  const parsed=publicConfigSchema.parse(environment);
  return{url:parsed.NEXT_PUBLIC_SUPABASE_URL,publishableKey:parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY};
}
export function parseServerSupabaseConfig(environment:Record<string,string|undefined>):ServerSupabaseConfig{
  const parsed=serverConfigSchema.parse(environment);
  return{url:parsed.NEXT_PUBLIC_SUPABASE_URL,publishableKey:parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secretKey:parsed.SUPABASE_SECRET_KEY};
}
export function createSupabaseBrowserClient(config:PublicSupabaseConfig){return createBrowserClient(config.url,config.publishableKey)}
export function createUserScopedSupabaseClient(config:PublicSupabaseConfig,accessToken:string){return createClient(config.url,config.publishableKey,{global:{headers:{Authorization:`Bearer ${accessToken}`}},auth:{persistSession:false,autoRefreshToken:false}})}
export function createServerOnlySupabaseClient(config:ServerSupabaseConfig){return createClient(config.url,config.secretKey,{auth:{persistSession:false,autoRefreshToken:false}})}

