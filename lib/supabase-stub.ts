import { SupabaseClient } from '@supabase/supabase-js';

// Deep mock proxy that mimics Supabase chainable API
export const createSafeSupabaseStub = (): SupabaseClient => {
  const proxyFn = () => new Proxy(proxyFn, handler);
  const handler = {
    get: (target: any, prop: any) => {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        };
      }
      return new Proxy(proxyFn, handler);
    }
  };
  return new Proxy(proxyFn, handler) as unknown as SupabaseClient;
};
