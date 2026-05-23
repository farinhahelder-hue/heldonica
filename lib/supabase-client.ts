import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client if configured, otherwise create a stub that won't crash
const _supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export a wrapper that always has auth property (even if _supabase is null)
// This prevents crashes in the Supabase library when it accesses .auth.token
export const supabase = _supabase || {
  auth: {
    // Supabase library reads/writes this property during initialization
    token: { access_token: null, refresh_token: null },
    // Required methods
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    setSession: async () => ({ data: { session: null }, error: null }),
  },
} as ReturnType<typeof createClient>;
