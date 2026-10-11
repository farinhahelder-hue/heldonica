import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  const handler = {
    get(target: any, prop: string, receiver: any) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined;
      }
      return function (...args: any[]) {
        if (prop === 'single' || prop === 'maybeSingle') {
           return Promise.resolve({ data: null, error: null });
        }
        if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete') {
            const chain: any = new Proxy({}, handler);
            chain.then = (res: any) => res({ data: [], error: null });
            chain.catch = () => {};
            chain.finally = (res: any) => res();
            return chain;
        }
        return new Proxy({}, handler);
      };
    }
  };
  return new Proxy({}, handler) as any as SupabaseClient;
}
