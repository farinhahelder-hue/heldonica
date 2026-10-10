import { SupabaseClient } from '@supabase/supabase-js';

function createChainableProxy(): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }
      if (prop === 'catch' || prop === 'finally') {
        return () => createChainableProxy();
      }
      return createChainableProxy();
    },
    apply() {
      return createChainableProxy();
    }
  };
  return new Proxy(() => {}, handler);
}

export function createSafeSupabaseStub(): SupabaseClient {
  return createChainableProxy();
}
