import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  const handler = {
    get(target: any, prop: string): any {
      if (prop === 'then') return undefined; // Not a promise itself

      return new Proxy(() => {}, {
        get(fnTarget, fnProp) {
          return handler.get(target, fnProp as string);
        },
        apply(fnTarget, thisArg, argumentsList) {
          // Allow chaining like .from('table').select('*').eq('id', 1)
          if (prop === 'then') {
             // Mock resolving the query promise if awaited
             const resolve = argumentsList[0];
             return resolve({ data: null, error: null });
          }
          return new Proxy(() => {}, handler);
        }
      });
    }
  };

  return new Proxy({}, handler) as SupabaseClient;
}
