/**
 * Contenu global (header, footer, réglages) — chargement côté serveur.
 *
 * `useContentLoader` récupérait ces données côté client, avec `cache: 'no-store'`
 * et sans cache partagé entre instances du hook. Sur une page qui monte Header,
 * Footer et HomeClient, cela faisait six requêtes (`/api/cms/zones` et
 * `/api/cms/settings`, trois fois chacune) à chaque affichage — et, le temps
 * qu'elles reviennent, le header et le pied de page affichaient leurs valeurs
 * codées en dur. Ce sont aussi ces valeurs-là que voit un crawler qui n'exécute
 * pas le JS.
 *
 * On charge donc une fois, dans le layout serveur, et on diffuse via contexte.
 */

import { createServiceClient } from '@/lib/supabase'
import type { CmsZone } from '@/lib/content-loader'
import { isPublicGlobalZone } from '@/lib/public-global-zones'

/** Zones indexées par `zone_key` nu — la forme attendue par `getCmsOrSetting`. */
export type GlobalZones = Record<string, CmsZone>

/**
 * Zones « global » — header, pied de page et blocs transverses.
 *
 * Chargées par requête (`page = 'global'`), sans liste blanche écrite ici.
 *
 * Historique : une liste blanche (`CONSUMED_ZONE_KEYS`) filtrait les clés servies.
 * Il fallait l'étendre à la main pour chaque zone nouvelle — une zone créée depuis
 * le CMS restait donc invisible tant que le code n'avait pas été modifié. C'est ce
 * qui interdisait d'ajouter une entrée de menu sans développeur. Mesuré le
 * 25/10/2026 : les 156 zones actives de `global` étaient toutes déjà dans la liste,
 * qui ne retirait donc rien — elle ne bloquait que les suivantes.
 *
 * Le filtre n'est pas supprimé mais **déclaré** (`lib/public-global-zones.json`) :
 * une zone n'est servie que si son préfixe est reconnu, ou si sa clé exacte est
 * listée. Une zone hors déclaration n'est **pas** publiée, et fait échouer
 * `check-cms-zones.mjs` — la précaution de confidentialité reste tenue (ne pas
 * exposer dans le HTML public une valeur qu'aucun composant n'affiche), sans
 * exiger de développeur pour chaque zone nouvelle.
 */

/**
 * Charge les zones actives destinées au header, au pied de page et aux blocs
 * transverses.
 *
 * Seulement celles de la page `global`. L'index se fait par `zone_key` seul (la
 * forme qu'attend `getCmsOrSetting`), or d'autres pages réutilisent les mêmes
 * clés : `stat_1_label` existe aussi sur `expert-hotelier` et `a-propos`,
 * `newsletter_title` sur `start` et `home`. Sans filtre de page, la dernière
 * ligne lue l'emportait, dans un ordre que Postgres ne garantit pas : relevé du
 * 19/10/2026, l'accueil affichait « 4+ de dépendance moyenne aux plateformes »
 * (le libellé hôtelier) dans 12 chargements sur 13, et le bloc newsletter les
 * textes de /start au lieu de ceux de `global`.
 */
export async function getGlobalZones(): Promise<GlobalZones> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_editable_zones')
      .select('id, page, zone_key, zone_type, value, is_active')
      .eq('is_active', true)
      .eq('page', 'global')

    if (error) {
      console.error('[SiteContent] Erreur de lecture des zones globales:', error.message)
      return {}
    }

    const zones: GlobalZones = {}
    for (const row of (data ?? []) as CmsZone[]) {
      if (row.value == null) continue
      // Zone hors déclaration publique (ou préfixée `_prive_`) : écartée du rendu.
      // Elle reste éditable au CMS ; `check-cms-zones.mjs` exige qu'elle soit
      // déclarée ou renommée, plutôt que de la publier en silence.
      if (!isPublicGlobalZone(row.zone_key)) continue
      zones[row.zone_key] = row
    }
    return zones
  } catch (err) {
    console.error(
      '[SiteContent] Erreur inattendue au chargement des zones globales:',
      err instanceof Error ? err.message : String(err)
    )
    return {}
  }
}
