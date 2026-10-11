import { SupabaseClient } from '@supabase/supabase-js';

export function createSafeSupabaseStub(): SupabaseClient {
  const createChainable = (): any => {
      const p = Promise.resolve({ data: null, error: null });
      return Object.assign(p, {
          select: () => createChainable(),
          eq: () => createChainable(),
          in: () => createChainable(),
          or: () => createChainable(),
          order: () => createChainable(),
          limit: () => createChainable(),
          match: () => createChainable(),
          single: () => createChainable(),
          maybeSingle: () => createChainable(),
          from: () => createChainable(),
          neq: () => createChainable(),
          insert: () => createChainable(),
          update: () => createChainable(),
          upsert: () => createChainable(),
          delete: () => createChainable(),
      })
  }
  return {
    from: () => createChainable(),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      })
    },
    // Missing fields mock for SupabaseClient
    supabaseUrl: 'https://stub.supabase.co',
    supabaseKey: 'stub',
    realtime: {},
    realtimeUrl: '',
    channels: [],
    functions: {},
    schema: () => createChainable(),
    channel: () => ({}),
    getChannels: () => [],
    removeChannel: () => Promise.resolve('ok'),
    removeAllChannels: () => Promise.resolve('ok'),
    rpc: () => createChainable(),
  } as any;
}
