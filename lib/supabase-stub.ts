import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
        };
      }
      if (prop === 'from') {
        return () => new Proxy({}, handler);
      }
      if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete' || prop === 'upsert' || prop === 'eq' || prop === 'in' || prop === 'contains' || prop === 'order' || prop === 'limit' || prop === 'single' || prop === 'maybeSingle' || prop === 'or') {
        return () => new Proxy({}, handler);
      }
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }
      if (prop === 'catch') {
        return () => new Proxy({}, handler);
      }
      if (prop === 'finally') {
        return () => new Proxy({}, handler);
      }
      return () => new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler) as SupabaseClient;
}
