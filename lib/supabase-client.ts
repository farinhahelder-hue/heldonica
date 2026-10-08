import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClientKey } from '@/lib/supabase-key';
import { createSafeSupabaseStub } from '@/lib/supabase-stub';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = getSupabaseClientKey();

// Create client if configured
const _supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export supabase - always has auth property and chainable builder to prevent crashes
// When not configured, returns a safe proxy stub
const stub: SupabaseClient = createSafeSupabaseStub();

export const supabase: SupabaseClient = _supabase ?? stub;

