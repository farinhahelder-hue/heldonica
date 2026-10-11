import { SupabaseClient } from '@supabase/supabase-js';
export function createSafeSupabaseStub(): SupabaseClient<any, "public", "public"> {
  return {} as unknown as SupabaseClient<any, "public", "public">;
}
