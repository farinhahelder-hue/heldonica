import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined;
      }
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
        };
      }
      return function (...args: any[]) {
        return createSafeSupabaseStub();
      };
    }
  }) as any as SupabaseClient;
}
