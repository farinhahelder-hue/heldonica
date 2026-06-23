import { supabase } from './supabase-client'

export interface SiteSettings {
  [key: string]: string
}

/** Get color settings as CSS variables */
export async function getColorSettings(): Promise<Record<string, string>> {
  const all = await getSiteSettings()
  const colors: Record<string, string> = {}
  const colorKeys = ['color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text']
  colorKeys.forEach(k => {
    if (all[k]) colors[k] = all[k]
  })
  return colors
}

/** Get site assets (logo, favicon) */
export async function getSiteAssets(): Promise<{ logo?: string; favicon?: string }> {
  const all = await getSiteSettings()
  return {
    logo: all.site_logo || all.logo_url,
    favicon: all.site_favicon || all.favicon_url,
  }
}

/** Get all site settings as a key-value object */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return {}

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error || !data) return {}

    const settings: SiteSettings = {}
    data.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value || ''
    })

    return settings
  } catch (err) {
    return {}
  }
}

/** Get specific settings by keys */
export async function getSettings(...keys: string[]): Promise<SiteSettings> {
  const all = await getSiteSettings()
  const result: SiteSettings = {}
  keys.forEach(k => { if (all[k]) result[k] = all[k] })
  return result
}
