import { describe, expect, it } from "vitest";
import { parsePublicSupabaseConfig, parseServerSupabaseConfig } from "./index";
describe("Supabase configuration",()=>{
  it("accepts a project URL and publishable key for public clients",()=>{expect(parsePublicSupabaseConfig({NEXT_PUBLIC_SUPABASE_URL:"https://example.supabase.co",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_example"}).url).toContain("supabase.co")});
  it("requires a non-public server secret name",()=>{expect(()=>parseServerSupabaseConfig({NEXT_PUBLIC_SUPABASE_URL:"https://example.supabase.co",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_example"})).toThrow()});
});

