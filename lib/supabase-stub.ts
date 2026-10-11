import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        };
      }

      const chainable = () => new Proxy({}, {
        get(t, p) {
          if (p === 'then') {
            return (resolve: any) => resolve({ data: null, error: null });
          }
          if (p === 'catch') {
            return (reject: any) => new Proxy({}, { get: (t2, p2) => p2 === 'finally' ? (fn: any) => fn() : undefined });
          }
          if (p === 'finally') {
            return (fn: any) => fn();
          }
          return chainable;
        }
      });

      return chainable;
    }
  }) as unknown as SupabaseClient;
}
