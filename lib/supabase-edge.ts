/**
 * Edge-compatible Supabase client for middleware and serverless functions
 * Uses fetch API directly - compatible with Edge runtime
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

/**
 * Fetch maintenance mode status from Supabase
 * Returns true if maintenance is active, false otherwise
 * Fails open (returns false) if Supabase is unreachable
 */
export async function getMaintenanceMode(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('[Edge] Supabase not configured, defaulting to maintenance=false');
    return false;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.maintenance_mode&select=value`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'single object'
      },
      // Edge runtime cache - short TTL for quick propagation
      next: { revalidate: 30 } // 30 seconds max
    });

    if (!response.ok) {
      console.error('[Edge] Supabase error:', response.status, response.statusText);
      return false; // Fail open
    }

    const data = await response.json();
    const value = data?.value;
    
    // Support multiple truthy values
    return value === 'true' || value === '1' || value === true;
  } catch (error) {
    console.error('[Edge] Failed to fetch maintenance mode from Supabase:', error);
    return false; // Fail open - keep site accessible
  }
}

/**
 * Get a setting value from site_settings table
 */
export async function getSetting(key: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'single object'
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.value ?? null;
  } catch (error) {
    console.error(`[Edge] Failed to fetch setting ${key}:`, error);
    return null;
  }
}

/**
 * Update a setting value in site_settings table
 * Returns true on success
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey!,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key,
          value,
          updated_at: new Date().toISOString()
        })
      }
    );

    return response.ok;
  } catch (error) {
    console.error(`[Edge] Failed to set setting ${key}:`, error);
    return false;
  }
}