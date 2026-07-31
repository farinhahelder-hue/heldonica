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

/** Zones indexées par `zone_key` nu — la forme attendue par `getCmsOrSetting`. */
export type GlobalZones = Record<string, CmsZone>

/**
 * Les seules clés que le front lit via `getCmsOrSetting`.
 *
 * On ne sérialise que celles-là. Charger toutes les zones actives ferait passer
 * ~367 lignes dans le payload de CHAQUE page (mesuré : +80 Ko de HTML), pour
 * neuf valeurs réellement utilisées.
 *
 * C'est aussi une précaution de confidentialité. `lib/home-data.ts` renvoie
 * toutes les zones actives de l'accueil et les passe en props : c'est
 * précisément ce qui a fait fuiter dans le HTML public les résidus « Monica
 * Schneider / Executive Coach » d'un ancien projet, invisibles à l'écran mais
 * lus par Googlebot. On n'expose que ce qui est affiché.
 *
 * Toute nouvelle clé lue par `getCmsOrSetting` doit être ajoutée ici, sinon
 * elle retombera silencieusement sur son fallback.
 */
const CONSUMED_ZONE_KEYS = [
  // Header
  'header_site_name',
  'header_cta_label',
  'header_cta_url',
  'header_logo_url',
  // Footer
  'footer_tagline',
  'footer_newsletter_cta',
  'footer_email_placeholder',
  'footer_cta_label',
  'footer_cta_url',
  // Accueil — hero et compteurs
  'hero_video_url',
  'hero_poster_image',
  'stat_1_nb',
  'stat_1_label',
  'stat_2_nb',
  'stat_2_label',
  'stat_3_label',
  'stat_4_label',
] as const

/**
 * Charge les zones actives destinées au header, au pied de page et aux blocs
 * transverses.
 *
 * `useContentLoader` appelait `/api/cms/zones` sans filtre de page et indexait
 * le résultat par `zone_key` seul : deux pages qui utilisent la même clé
 * s'écrasent mutuellement. On conserve cette indexation pour ne rien changer au
 * rendu, mais en ne ramenant que les clés effectivement lues.
 */
export async function getGlobalZones(): Promise<GlobalZones> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_editable_zones')
      .select('id, page, zone_key, zone_type, value, is_active')
      .eq('is_active', true)
      .in('zone_key', CONSUMED_ZONE_KEYS as unknown as string[])

    if (error) {
      console.error('[SiteContent] Erreur de lecture des zones globales:', error.message)
      return {}
    }

    const zones: GlobalZones = {}
    for (const row of (data ?? []) as CmsZone[]) {
      if (row.value == null) continue
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
