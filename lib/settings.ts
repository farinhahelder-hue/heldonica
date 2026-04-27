import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface SiteSettings {
  [key: string]: string
}

/** Get all site settings as a key-value object */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return {}
  
  const { data, error } = await supabase
    .from('cms_settings')
    .select('key, value')
  
  if (error || !data) return {}
  
  const settings: SiteSettings = {}
  data.forEach(s => {
    settings[s.key] = s.value || ''
  })
  
  return settings
}

/** Get specific settings by keys */
export async function getSettings(...keys: string[]): Promise<SiteSettings> {
  const all = await getSiteSettings()
  const result: SiteSettings = {}
  keys.forEach(k => { if (all[k]) result[k] = all[k] })
  return result
}
