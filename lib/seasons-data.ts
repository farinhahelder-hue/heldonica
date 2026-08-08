/**
 * Seasons — lecture CMS côté serveur.
 *
 * Source de vérité UNIQUE : table Supabase `cms_seasons`.
 * Alimente le composant SeasonalTable sur les pages piliers.
 *
 * En cas d'échec de lecture (base injoignable, table absente), retourne un
 * tableau vide : la section SeasonalTable disparaît côté rendu plutôt que
 * d'afficher du contenu périmé ou de planter la page. L'échec est loggué.
 */

import { createServiceClient } from '@/lib/supabase'
import type { SeasonData } from '@/components/SeasonalTable'

function normalizeLevel(value: unknown): 'low' | 'medium' | 'high' {
  return value === 'low' || value === 'high' ? value : 'medium'
}

/**
 * Charge les saisons actives d'une destination, ordonnées.
 * Retourne [] si aucune donnée ou en cas d'erreur.
 */
export async function fetchSeasons(destinationSlug: string): Promise<SeasonData[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_seasons')
      .select('season_label, emoji, months_array, weather, crowd, price, note, sort_order')
      .eq('destination_slug', destinationSlug.toLowerCase())
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error(`[CMS seasons] Erreur de lecture pour "${destinationSlug}":`, error.message)
      return []
    }

    return (data ?? [])
      .filter((row) => Array.isArray(row.months_array) && row.months_array.length > 0)
      .map((row) => ({
        name: row.season_label,
        emoji: row.emoji ?? '',
        months: row.months_array as string[],
        weather: row.weather ?? '',
        crowd: normalizeLevel(row.crowd),
        price: normalizeLevel(row.price),
        description: row.note ?? '',
      }))
  } catch (err) {
    console.error(
      `[CMS seasons] Erreur inattendue au chargement de "${destinationSlug}":`,
      err instanceof Error ? err.message : String(err)
    )
    return []
  }
}
