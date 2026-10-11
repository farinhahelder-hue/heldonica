import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  const stub = {
    from: () => stub,
    select: () => stub,
    insert: () => stub,
    update: () => stub,
    delete: () => stub,
    eq: () => stub,
    or: () => stub,
    in: () => stub,
    neq: () => stub,
    gt: () => stub,
    gte: () => stub,
    lt: () => stub,
    lte: () => stub,
    like: () => stub,
    ilike: () => stub,
    is: () => stub,
    order: () => stub,
    limit: () => stub,
    range: () => stub,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
    catch: () => stub,
    finally: (cb: any) => { cb(); return stub; },
  };
  return stub as unknown as SupabaseClient;
}
