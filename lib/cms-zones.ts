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

/** Clé plate `page__zone_key`, format attendu par InlineEditProvider. */
export type ZoneMap = Record<string, string>

/**
 * Charge les zones actives d'une page.
 *
 * `is_active` est le seul état de publication de `cms_editable_zones` : il n'y
 * a pas de distinction brouillon/publié. Une zone inactive n'est donc jamais
 * servie, et la page retombe sur le fallback du composant.
 *
 * En cas d'échec, retourne une map vide plutôt que de faire échouer le rendu :
 * la page s'affiche avec ses fallbacks, et l'erreur est loggée.
 */
export async function getPageZones(page: string): Promise<ZoneMap> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_editable_zones')
      .select('page, zone_key, value')
      .eq('page', page)
      .eq('is_active', true)

    if (error) {
      console.error(`[CMS zones] Erreur de lecture pour la page "${page}":`, error.message)
      return {}
    }

    const map: ZoneMap = {}
    for (const row of data ?? []) {
      // Une valeur nulle n'est pas une valeur : on laisse le fallback jouer
      // plutôt que d'afficher une chaîne vide à la place du texte attendu.
      if (row.value == null) continue
      map[`${row.page}__${row.zone_key}`] = row.value
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
