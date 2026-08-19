/**
 * Edge-compatible Supabase client for middleware and serverless functions
 * Uses fetch API directly - compatible with Edge runtime
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

/**
 * Les nouvelles cles Supabase (sb_secret_..., sb_publishable_...) ne sont pas
 * des JWT : le gateway les resout directement via `apikey`. L'ancienne cle
 * service_role (JWT HS256, prefixe eyJ) a besoin de `Authorization: Bearer`
 * pour que PostgREST en lise le role. On envoie les deux headers seulement
 * quand c'est encore l'ancien format, pour rester compatible avant/apres
 * la rotation de cle sans devoir toucher ce fichier une seconde fois.
 */
function authHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: key };
  if (key.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  return headers;
}

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
/**
 * Retourne true/false si le CMS a explicitement défini la valeur,
 * ou null si non configuré / erreur (laisser le défaut du middleware décider).
 */
export async function getMaintenanceMode(): Promise<boolean | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.maintenance_mode&select=value`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(supabaseServiceKey!),
        'Prefer': 'single object'
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      // 406 = row doesn't exist → CMS n'a pas encore défini la valeur
      return null;
    }

    const data = await response.json();
    const value = data?.value;

    if (value === 'true' || value === '1' || value === true)  return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return null; // valeur inconnue → laisser le défaut décider
  } catch {
    return null; // Supabase injoignable → laisser le défaut décider
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
          ...authHeaders(supabaseServiceKey!),
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
          ...authHeaders(supabaseServiceKey!),
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