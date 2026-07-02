/**
 * Content Loader — CMS 3.0 Architecture
 * 
 * Architecture de lecture (cascade de fallback):
 * 1. cms_editable_zones (page='global', is_active=true) ← priorité absolue
 * 2. site_settings (key matching)                         ← fallback legacy
 * 3. Valeur hardcodée dans le composant                   ← dernier recours
 */

import { supabase } from './supabase-client';

// Types
export interface CmsZone {
  id: string;
  page: string;
  zone_key: string;
  zone_type: string;
  value: string;
  is_active: boolean;
}

export interface CmsZonesData {
  zones: Record<string, CmsZone>;
  byPage: Record<string, Record<string, CmsZone>>;
}

// Cache client-side pour éviter les appels répétés
let cachedZones: CmsZonesData | null = null;
let zonesFetchPromise: Promise<CmsZonesData> | null = null;

/**
 * Fetch les zones CMS depuis l'API
 * Utilise un cache simple côté client
 */
export async function fetchCmsZones(page?: string): Promise<CmsZonesData> {
  // Retourner le cache si disponible
  if (cachedZones && !page) {
    return cachedZones;
  }

  // Éviter les appels parallèles
  if (zonesFetchPromise && !page) {
    return zonesFetchPromise;
  }

  const url = page 
    ? `/api/cms/zones?page=${page}`
    : '/api/cms/zones';

  zonesFetchPromise = fetch(url, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('Failed to fetch zones');
      return r.json() as Promise<CmsZonesData>;
    })
    .then(data => {
      if (!page) {
        cachedZones = data;
      }
      return data;
    })
    .catch(err => {
      console.error('[ContentLoader] Error fetching zones:', err);
      return { zones: {}, byPage: {} };
    });

  return zonesFetchPromise;
}

/**
 * Invalider le cache des zones (appelé après mise à jour CMS)
 */
export function invalidateZonesCache(): void {
  cachedZones = null;
  zonesFetchPromise = null;
}

// Mapping: zone_key → site_settings key
// Pour les clés qui font doublon entre cms_editable_zones et site_settings
const ZONE_TO_SETTING_MAP: Record<string, string> = {
  'header_site_name': 'site_name',
  'header_cta_label': 'primary_cta_label',
  'header_cta_url': 'primary_cta_url',
  'header_logo_url': 'logo_url',
  'footer_tagline': 'site_tagline',
  'footer_cta_label': 'footer_cta_label',
  'footer_cta_url': 'footer_cta_url',
  'footer_copyright': 'footer_text',
  'footer_email': 'contact_email',
  'social_instagram_url': 'social_instagram',
  'social_youtube_url': 'social_youtube',
  'social_pinterest_url': 'social_pinterest',
  'social_facebook_url': 'social_facebook',
  'social_tiktok_url': 'social_tiktok',
  'social_linkedin_url': 'social_linkedin',
  'instagram_section_title': 'instagram_section_title',
  'instagram_cta_text': 'instagram_cta_text',
  'cta_travel_planning_title': 'cta_travel_planning_title',
  'cta_travel_planning_text': 'cta_travel_planning_text',
  'cta_travel_planning_cta': 'cta_travel_planning_cta',
  'newsletter_badge': 'newsletter_badge',
  'newsletter_title': 'newsletter_title',
  'newsletter_desc': 'newsletter_desc',
  'newsletter_cta': 'newsletter_cta',
  'newsletter_placeholder': 'newsletter_placeholder',
  'newsletter_disclaimer': 'newsletter_disclaimer',
};

/**
 * Helper principal de lecture content
 * 
 * @param zoneKey - Clé de la zone CMS (ex: 'footer_tagline')
 * @param settingKey - Clé site_settings fallback (ex: 'site_tagline')
 * @param fallback - Valeur par défaut hardcodée
 * @param cmsZones - Données zones CMS (optionnel, sera fetch si absent)
 * @param settings - Données site_settings (optionnel)
 * @returns La valeur优先순위: CMS > site_settings > fallback
 */
export function getZoneValue(
  zoneKey: string,
  fallback: string,
  cmsZones?: Record<string, CmsZone>,
  settings?: Record<string, string>
): string {
  // 1. cms_editable_zones (priorité absolue)
  if (cmsZones && cmsZones[zoneKey]?.value) {
    return cmsZones[zoneKey].value;
  }

  // 2. site_settings (fallback legacy via mapping)
  const settingKey = ZONE_TO_SETTING_MAP[zoneKey];
  if (settingKey && settings && settings[settingKey]) {
    return settings[settingKey];
  }

  // 3. Valeur hardcodée (dernier recours)
  return fallback;
}

/**
 * Helper simplifié pour les cas simples
 * Appelle getZoneValue avec les données disponibles
 */
export async function loadContent(
  zoneKey: string,
  fallback: string
): Promise<string> {
  try {
    const data = await fetchCmsZones();
    return getZoneValue(zoneKey, fallback, data.zones);
  } catch {
    return fallback;
  }
}

/**
 * Hook-compatible: obtenir la valeur avec settings legacy
 */
export function getCmsOrSetting(
  zoneKey: string,
  settingKey: string,
  fallback: string,
  cmsZones?: Record<string, CmsZone>,
  settings?: Record<string, string>
): string {
  // 1. cms_editable_zones (priorité)
  if (cmsZones && cmsZones[zoneKey]?.value) {
    return cmsZones[zoneKey].value;
  }

  // 2. site_settings (fallback)
  if (settings && settings[settingKey]) {
    return settings[settingKey];
  }

  // 3. Hardcoded fallback
  return fallback;
}

// Types are exported at the top
