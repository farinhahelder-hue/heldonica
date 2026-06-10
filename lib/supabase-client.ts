import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client if configured
const _supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create promise-like objects that support .then() and .catch()
const stubPromise = (data: any) => {
  const promise = Promise.resolve({ data, error: null });
  return {
    then: (onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) => 
      promise.then(onfulfilled).catch(onrejected || (() => {})),
    catch: (onrejected: (reason: any) => any) => promise.catch(onrejected),
  };
};

// Create a query builder stub that chains methods properly
const createStubBuilder = () => {
  // Methods that return another builder (for chaining)
  const builder = {
    select: (columns?: string) => {
      const result = { ...builder };
      return result;
    },
    eq: (column: string, value: any) => ({ ...builder }),
    order: (column: string, options?: { ascending?: boolean }) => stubPromise([]),
    limit: (count: number) => ({ ...builder }),
    single: () => stubPromise(null),
    upsert: (data: any, options?: any) => ({ select: () => stubPromise([]) }),
    update: (data: any) => ({ eq: () => stubPromise(null) }),
    insert: (data: any) => ({ select: () => stubPromise(null) }),
    delete: () => ({ eq: () => stubPromise(null) }),
    // Promise-like interface
    then: (onfulfilled: Function, onrejected?: Function) => stubPromise([]).then(onfulfilled, onrejected),
    catch: (onrejected: Function) => stubPromise([]).catch(onrejected),
  };
  return builder;
};

// Export supabase - always has auth property to prevent crashes
// When not configured, returns a minimal stub with .from() support
const stub: SupabaseClient = {
  from: () => createStubBuilder(),
  auth: {
    token: { access_token: null, refresh_token: null },
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    setSession: async () => ({ data: { session: null }, error: null }),
    refreshSession: async () => ({ data: { session: null }, error: null }),
    update: async () => ({ data: { user: null, session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signInWithOAuth: async () => ({ data: { url: '', provider: 'google' as any }, error: null }),
  },
} as any;

export const supabase: SupabaseClient = _supabase ?? stub;
