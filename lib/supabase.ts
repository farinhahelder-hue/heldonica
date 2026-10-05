import { createClient } from '@supabase/supabase-js'
import { getSupabaseClientKey } from '@/lib/supabase-key'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = getSupabaseClientKey()

// Public client (uses anon key - respects RLS policies)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Service role client (bypasses RLS - for admin operations only)
// Only use this on server-side, never expose to client
export const createServiceClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    // Return a safe proxy for Vercel preview builds where secrets are missing
    console.warn('[Supabase] Missing credentials for service client, using safe stub.');

    // Simple deep proxy that returns { data: null, error: ... } at the end of any chain
    const makeProxy = () => {
      const target = () => ({ data: null, error: new Error('Supabase client stubbed (missing credentials)') });
      return new Proxy(target, {
        get(obj, prop) {
          if (prop === 'then') return undefined; // so it's not treated as a Promise accidentally
          return makeProxy();
        },
        apply() {
          return { data: null, error: new Error('Supabase client stubbed (missing credentials)') };
        }
      });
    };
    return makeProxy() as any;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
