import type { SupabaseClient } from '@supabase/supabase-js';

// Minimal mock to satisfy TypeScript in components where Supabase is imported but fails without env vars
export function createSafeSupabaseStub(): SupabaseClient {
  const handler = {
    get(target: any, prop: string): any {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        };
      }

      // Handle promise resolution
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }
      if (prop === 'catch') {
        return () => new Proxy({}, handler);
      }
      if (prop === 'finally') {
        return (cb: any) => { cb(); return new Proxy({}, handler); };
      }

      return new Proxy(() => new Proxy({}, handler), handler);
    },
    apply(target: any, thisArg: any, argumentsList: any[]) {
      return new Proxy(() => new Proxy({}, handler), handler);
    }
  };

  return new Proxy({}, handler) as SupabaseClient;
}
