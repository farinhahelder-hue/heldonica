import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  return {} as SupabaseClient;
}
