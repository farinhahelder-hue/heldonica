'use client'

import { useState, useEffect, useCallback } from 'react';
import { CmsZone, CmsZonesData } from '@/lib/content-loader';

// Types
export interface ContentLoaderState {
  zones: Record<string, CmsZone>;
  settings: Record<string, string>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour charger les zones CMS et settings
 * Utilise un cache simple pour éviter les appels répétés
 */
export function useContentLoader() {
  const [state, setState] = useState<ContentLoaderState>({
    zones: {},
    settings: {},
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Parallel fetch: zones CMS + settings legacy
      const [zonesRes, settingsRes] = await Promise.all([
        fetch('/api/cms/zones', { cache: 'no-store' }),
        fetch('/api/cms/settings', { cache: 'no-store' }),
      ]);

      if (!zonesRes.ok) {
        throw new Error('Failed to fetch zones');
      }

      const zonesData: CmsZonesData = await zonesRes.json();
      const settings = settingsRes.ok ? await settingsRes.json() : {};

      setState({
        zones: zonesData.zones || {},
        settings,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('[useContentLoader] Error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Load failed',
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    ...state,
    refresh,
  };
}

// Mapping: zone_key → site_settings key
const ZONE_TO_SETTING_MAP: Record<string, string> = {
  'header_site_name': 'site_name',
  'header_cta_label': 'primary_cta_label',
  'header_cta_url': 'primary_cta_url',
  'header_logo_url': 'logo_url',
  'footer_tagline': 'site_tagline',
  'footer_cta_label': 'footer_cta_label',
  'footer_cta_url': 'footer_cta_url',
};

/**
 * Helper pour obtenir une valeur avec fallback en cascade
 */
export function getCmsOrSetting(
  zoneKey: string,
  settingKey: string,
  fallback: string,
  zones: Record<string, CmsZone>,
  settings: Record<string, string>
): string {
  // 1. cms_editable_zones (priorité)
  if (zones[zoneKey]?.value) {
    return zones[zoneKey].value;
  }

  // 2. site_settings (fallback)
  if (settings[settingKey]) {
    return settings[settingKey];
  }

  // 3. Hardcoded fallback
  return fallback;
}
