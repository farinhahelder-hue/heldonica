/**
 * Zones éditables — chargement côté serveur.
 *
 * `InlineEditProvider` récupère les zones côté client, après hydratation. Seul,
 * ce chemin a deux défauts pour un visiteur :
 *   - le HTML initial contient le fallback codé en dur, remplacé ensuite par la
 *     valeur CMS : le texte change sous les yeux du lecteur ;
 *   - c'est ce HTML initial que voit un crawler qui n'exécute pas le JS. Le
 *     contenu réellement publié n'est alors pas celui qui est indexé.
 *
 * On charge donc les zones sur le serveur et on les injecte au provider via
 * `initialZones` : le premier rendu porte déjà les bonnes valeurs. Le fetch
 * client subsiste pour rafraîchir après une édition admin.
 *
 * Même approche que `lib/home-data.ts` pour la page d'accueil, généralisée.
 */

import { createServiceClient } from '@/lib/supabase'
import { getTargetedZoneVariants, TargetingContext } from '@/lib/cms-targeting'
import { unstable_cache } from 'next/cache'

/** Clé plate `page__zone_key`, format attendu par InlineEditProvider. */
export type ZoneMap = Record<string, string>

/**
 * Cache la lecture brute des zones d'une page pour éviter de surcharger
 * Supabase à chaque appel SSR ou revalidation ISR.
 */
const getCachedRawZones = unstable_cache(
  async (page: string) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_editable_zones')
      .select('page, zone_key, value')
      .eq('page', page)
      .eq('is_active', true)

    if (error) {
      console.error(`[CMS zones] Erreur de lecture pour la page "${page}":`, error.message)
      return []
    }
    return data ?? []
  },
  ['cms-page-zones-raw'],
  { revalidate: 300, tags: ['cms-zones'] }
)

/**
 * Charge les zones actives d'une page avec prise en compte optionnelle du ciblage déclaratif.
 *
 * `is_active` est le seul état de publication de `cms_editable_zones` : il n'y
 * a pas de distinction brouillon/publié. Une zone inactive n'est donc jamais
 * servie, et la page retombe sur le fallback du composant.
 *
 * Si des variantes ciblées (saison, persona, UTM) existent pour cette page,
 * elles surchargent automatiquement les valeurs standards.
 *
 * En cas d'échec, retourne une map vide plutôt que de faire échouer le rendu :
 * la page s'affiche avec ses fallbacks, et l'erreur est loggée.
 */
export async function getPageZones(page: string, context?: TargetingContext): Promise<ZoneMap> {
  try {
    const data = await getCachedRawZones(page)

    const map: ZoneMap = {}
    for (const row of data ?? []) {
      // Une valeur nulle ou blanche n'est pas une valeur : on laisse le fallback
      // jouer plutôt que d'afficher un texte vide. Sans le test sur la chaîne
      // vide, `EditableZone` fait `zones[clé] ?? fallback` : la chaîne vide écrase
      // le fallback et le bloc se rend blanchi. Pour retirer une zone, on la passe
      // en `is_active = false`, pas en valeur vide.
      if (row.value == null || row.value.trim() === '') continue
      map[`${row.page}__${row.zone_key}`] = row.value
    }

    // Phase 4 : Surcharges par variantes ciblées si présentes
    try {
      const targeted = await getTargetedZoneVariants(page, context)
      Object.assign(map, targeted)
    } catch (variantErr) {
      console.warn(`[CMS zones] Impossible de charger les variantes pour "${page}":`, variantErr)
    }

    return map
  } catch (err) {
    console.error(
      `[CMS zones] Erreur inattendue au chargement de "${page}":`,
      err instanceof Error ? err.message : String(err)
    )
    return {}
  }
}
