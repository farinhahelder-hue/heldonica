import { supabase } from './supabase-client'
import { MADERE, MONTENEGRO, ROUMANIE } from './pillar-data'
import type { PillarData } from './pillar-types'

const PILLAR_MAP: Record<string, PillarData> = {
  madere: MADERE,
  montenegro: MONTENEGRO,
  roumanie: ROUMANIE,
}

export async function getPillarData(slug: string): Promise<PillarData> {
  const hardcoded = PILLAR_MAP[slug]
  if (!hardcoded) {
    throw new Error(`Unknown pillar: ${slug}`)
  }

  if (!supabase) return hardcoded

  try {
    const { data: dest } = await supabase
      .from('destinations')
      .select('slug, title, tagline, hero_unsplash_url, featured_image, country, flag_emoji, avg_budget_couple_week, best_season')
      .eq('slug', slug)
      .maybeSingle()

    if (!dest) return hardcoded

    return {
      ...hardcoded,
      hero: dest.hero_unsplash_url || dest.featured_image || hardcoded.hero,
      tagline: dest.tagline || hardcoded.tagline,
      name: dest.title || hardcoded.name,
      country: dest.country || hardcoded.country,
      flag: dest.flag_emoji || hardcoded.flag,
      budget: dest.avg_budget_couple_week ?? hardcoded.budget,
      season: dest.best_season || hardcoded.season,
    }
  } catch {
    return hardcoded
  }
}