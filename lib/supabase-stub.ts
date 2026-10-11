import { createClient } from "@supabase/supabase-js";
export function createSafeSupabaseStub(): any { return createClient("http://localhost:54321", "dummy", { global: { fetch: (input: any, init?: any) => Promise.resolve(new Response(JSON.stringify([]))) } }); }
