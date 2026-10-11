import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClientKey } from '@/lib/supabase-key';

const createSafeSupabaseStub = (): SupabaseClient => {
  const dummyPayload = { data: null, error: null };
  const handler = {
    get: function(target: any, prop: any) {
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
        };
      }
      if (prop === 'then') {
        return (resolve: any) => resolve(dummyPayload);
      }
      if (prop === 'catch') {
        return () => new Proxy({}, handler);
      }
      if (prop === 'finally') {
        return (callback: any) => {
          if (typeof callback === 'function') callback();
          return new Proxy({}, handler);
        };
      }
      return new Proxy(function() {}, handler);
    },
    apply: function() {
      return new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler) as any;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = getSupabaseClientKey();

// Create client if configured
const _supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export supabase - always has auth property and chainable builder to prevent crashes
// When not configured, returns a safe proxy stub
const stub: SupabaseClient = createSafeSupabaseStub();

export const supabase: SupabaseClient = _supabase ?? stub;
