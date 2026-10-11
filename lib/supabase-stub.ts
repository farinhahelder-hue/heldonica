import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a safe Proxy stub for the SupabaseClient to prevent crash during SSG
 * or when env vars are missing. The proxy intercepts chainable methods and
 * returns itself, resolving promises to dummy payloads.
 */
export function createSafeSupabaseStub(): SupabaseClient {
  return new Proxy({}, {
    get(target, prop, receiver) {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null })
      }
      if (prop === 'catch') {
        return () => receiver
      }
      if (prop === 'finally') {
        return (cb: any) => { cb?.(); return receiver }
      }
      // Handle the 'auth' object
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }
      return (...args: any[]) => receiver
    }
  }) as SupabaseClient
}
