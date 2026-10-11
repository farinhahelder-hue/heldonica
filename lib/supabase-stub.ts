import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient<any, 'public', any> {
  const handler = {
    get(target: any, prop: string) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        const p = Promise.resolve({ data: null, error: null });
        return (p as any)[prop].bind(p);
      }
      if (['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'or', 'limit', 'order', 'single', 'maybeSingle', 'rpc', 'from'].includes(prop)) {
        return () => new Proxy({}, handler);
      }
      return new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler) as any;
}
