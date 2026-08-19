/**
 * Pillar Data — lecture CMS
 *
 * Source de vérité UNIQUE : table Supabase `cms_pillar_pages`.
 *
 * Il n'y a volontairement plus de copie hardcodée du contenu ici. Jusqu'au
 * 2026-07-30 ce fichier embarquait ~200 lignes de contenu (intros, itinéraires,
 * FAQ, verdicts) servant de « fallback ». Comme la table n'existait pas en prod,
 * ce fallback était en réalité la source servie à chaque requête — et il a
 * masqué la panne pendant des mois sans le moindre signal.
 *
 * Ce qui reste ci-dessous est un fallback *technique* minimal : juste de quoi
 * ne pas planter le rendu et garder un titre correct si la base est
 * momentanément injoignable. Il ne contient aucun contenu éditorial : une panne
 * base se voit immédiatement (sections vides + log d'erreur) au lieu d'être
 * dissimulée derrière du contenu périmé.
 *
 * Les pages piliers sont en ISR : Next continue de servir le dernier rendu
 * valide pendant une coupure base, ce qui absorbe les incidents transitoires.
 *
 * Pour modifier le contenu : panel admin Heldonica → Destinations, ou
 * directement la table `cms_pillar_pages`.
 */

import type { PillarData } from '@/lib/pillar-types'
import { createServiceClient } from '@/lib/supabase'

export interface SubDestinationInfo {
  id?: string
  title: string
  slug: string
  parentSlug: string
  teaser: string
  emoji: string
  display_order?: number
}

/** Slugs des pages piliers pilotées par le CMS. */
export const PILLAR_SLUGS = ['madere', 'montenegro', 'roumanie'] as const
export type PillarSlug = (typeof PILLAR_SLUGS)[number]

/**
 * Identité minimale par pilier — nom, pays, drapeau.
 * Sert uniquement à produire un titre correct si la base est injoignable.
 * Toute donnée éditoriale vient de Supabase.
 */
const PILLAR_IDENTITY: Record<string, { name: string; country: string; flag: string }> = {
  madere: { name: 'Madère', country: 'Portugal', flag: '🇵🇹' },
  montenegro: { name: 'Monténégro', country: 'Monténégro', flag: '🇲🇪' },
  roumanie: { name: 'Roumanie', country: 'Roumanie', flag: '🇷🇴' },
}

/**
 * Fallback technique : structure valide, contenu vide.
 * Aucun contenu éditorial inventé — l'absence est visible, pas masquée.
 */
function buildTechnicalFallback(slug: string): PillarData {
  const identity = PILLAR_IDENTITY[slug] ?? { name: slug, country: '', flag: '' }
  return {
    slug,
    name: identity.name,
    country: identity.country,
    flag: identity.flag,
    hero: '',
    tagline: '',
    budget: 0,
    season: '',
    flight: '',
    visa: '',
    currency: '',
    language: '',
    seoTitle: `${identity.name} | Heldonica`,
    seoDesc: '',
    intro: [],
    infoTable: [],
    itinerary: [],
    budgetBreakdown: [],
    faq: [],
    accommodations: [],
  }
}

/** Mappe une ligne `cms_pillar_pages` vers le type consommé par le front. */
function mapRowToPillarData(row: Record<string, any>): PillarData {
  return {
    slug: row.slug,
    name: row.name,
    country: row.country,
    flag: row.flag || '',
    hero: row.hero || '',
    tagline: row.tagline || '',
    heroSubtitle: row.hero_subtitle,
    budget: row.budget,
    season: row.season || '',
    flight: row.flight || '',
    visa: row.visa || '',
    currency: row.currency || '',
    language: row.language || '',
    seoTitle: row.seo_title || row.name,
    seoDesc: row.seo_desc || '',
    intro: Array.isArray(row.intro) ? row.intro : [],
    infoTable: Array.isArray(row.info_table) ? row.info_table : [],
    itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
    budgetBreakdown: Array.isArray(row.budget_breakdown) ? row.budget_breakdown : [],
    faq: Array.isArray(row.faq) ? row.faq : [],
    accommodations: Array.isArray(row.accommodations) ? row.accommodations : [],
    // Objets vides traités comme absents : `{}` est truthy et ferait rendre
    // un encadré « testé par Heldonica » ou un verdict complètement vide.
    testedByHeldonica: hasKeys(row.tested_by_heldonica) ? row.tested_by_heldonica : undefined,
    verdict: hasKeys(row.verdict) ? row.verdict : undefined,
  }
}

function hasKeys(value: unknown): boolean {
  return !!value && typeof value === 'object' && Object.keys(value as object).length > 0
}

/**
 * Charge une page pilier depuis Supabase.
 * Retourne un fallback technique (structure vide) si la lecture échoue —
 * l'échec est systématiquement loggué.
 */
export async function fetchPillarData(slug: string): Promise<PillarData> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_pillar_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error(`[CMS pillar] Erreur de lecture pour "${slug}":`, error.message)
      return buildTechnicalFallback(slug)
    }

    if (!data) {
      console.warn(`[CMS pillar] Aucune ligne active pour "${slug}" dans cms_pillar_pages`)
      return buildTechnicalFallback(slug)
    }

    return mapRowToPillarData(data)
  } catch (err) {
    console.error(
      `[CMS pillar] Erreur inattendue au chargement de "${slug}":`,
      err instanceof Error ? err.message : String(err)
    )
    return buildTechnicalFallback(slug)
  }
}

/** Charge toutes les pages piliers actives. */
export async function fetchAllPillarData(): Promise<PillarData[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_pillar_pages')
      .select('*')
      .eq('is_active', true)
      .order('slug')

    if (error) {
      console.error('[CMS pillar] Erreur de lecture de la liste:', error.message)
      return []
    }

    return (data ?? []).map(mapRowToPillarData)
  } catch (err) {
    console.error(
      '[CMS pillar] Erreur inattendue au chargement de la liste:',
      err instanceof Error ? err.message : String(err)
    )
    return []
  }
}

export interface SeasonInfo {
  name: string
  emoji: string
  months: string[]
  weather: string
  crowd: 'low' | 'medium' | 'high'
  price: 'low' | 'medium' | 'high'
  description: string
}

/**
 * Charge les saisons actives pour une destination, triées par sort_order.
 * Retourne un tableau vide si la donnée est incomplète (moins de 3 saisons) :
 * le composant appelant garde alors son ancien tableau générique en repli.
 */
export async function fetchSeasons(destinationSlug: string): Promise<SeasonInfo[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_seasons')
      .select('*')
      .eq('destination_slug', destinationSlug)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error(`[CMS seasons] Erreur de lecture pour "${destinationSlug}":`, error.message)
      return []
    }

    const rows = data ?? []
    if (rows.length < 3) return []

    return rows.map(row => ({
      name: row.season_label,
      emoji: row.emoji || '',
      months: row.months_array || [],
      weather: row.weather || '',
      crowd: (row.crowd || 'medium') as SeasonInfo['crowd'],
      price: (row.price || 'medium') as SeasonInfo['price'],
      description: row.note || '',
    }))
  } catch (err) {
    console.error(
      `[CMS seasons] Erreur inattendue au chargement de "${destinationSlug}":`,
      err instanceof Error ? err.message : String(err)
    )
    return []
  }
}

/** Charge les sous-destinations actives pour une destination parente. */
export async function fetchSubDestinations(parentSlug: string): Promise<SubDestinationInfo[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_sub_destinations')
      .select('*')
      .eq('parent_slug', parentSlug)
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error(`[CMS sub-destinations] Erreur de lecture pour "${parentSlug}":`, error.message)
      return []
    }

    return (data ?? []).map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      parentSlug: row.parent_slug,
      teaser: row.teaser || '',
      emoji: row.emoji || '',
      display_order: row.display_order
    }))
  } catch (err) {
    console.error(
      `[CMS sub-destinations] Erreur inattendue au chargement de "${parentSlug}":`,
      err instanceof Error ? err.message : String(err)
    )
    return []
  }
}
