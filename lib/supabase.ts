import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClientKey } from '@/lib/supabase-key'
import { createSafeSupabaseStub } from '@/lib/supabase-stub'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = getSupabaseClientKey()

// Public client (uses anon key - respects RLS policies)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function isServiceClientConfigured(): boolean {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ''
  return Boolean(supabaseUrl && serviceKey)
}

// Service role client (bypasses RLS - for admin operations only)
// Only use this on server-side, never expose to client.
// In build time, CI, or preview environments without service keys,
// returns a safe query builder stub to prevent SSG/ISR prerendering crashes.
export const createServiceClient = (): SupabaseClient => {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[Supabase Service] Variables d\'environnement manquantes (URL/serviceKey). Utilisation du stub sécurisé pour le pré-rendu.')
    }
    return createSafeSupabaseStub()
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}