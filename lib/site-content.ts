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
 * Génère les clés d'un menu indexé : `nav_item_1_label`, `nav_item_1_url`, …
 * Le nombre d'entrées est borné volontairement ; pour allonger un menu depuis
 * le CMS, il faut augmenter ce compte, sinon les entrées supplémentaires ne
 * remonteraient pas jusqu'au front.
 */
function buildLinkKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => [
    `${prefix}_${i + 1}_label`,
    `${prefix}_${i + 1}_url`,
  ]).flat()
}

/**
 * Les seules clés que le front lit, via `getCmsOrSetting` ou `getZoneLinks`.
 *
 * On ne sérialise que celles-là. Charger toutes les zones actives ferait passer
 * ~367 lignes dans le payload de CHAQUE page (mesuré : +80 Ko de HTML), pour
 * une poignée de valeurs réellement affichées.
 *
 * C'est aussi une précaution de confidentialité. `lib/home-data.ts` renvoie
 * toutes les zones actives de l'accueil et les passe en props : c'est
 * précisément ce qui a fait fuiter dans le HTML public les résidus « Monica
 * Schneider / Executive Coach » d'un ancien projet, invisibles à l'écran mais
 * lus par Googlebot. On n'expose que ce qui est affiché.
 *
 * Toute nouvelle clé lue par le front doit être ajoutée ici, sinon elle
 * retombera silencieusement sur son fallback codé en dur.
 */
const CONSUMED_ZONE_KEYS: string[] = [
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

  // Pied de page — titres de colonnes, mentions, contact
  'nav_footer_title',
  'destinations_footer_title',
  'guides_footer_title',
  'legal_footer_title',
  'footer_copyright',
  'footer_email',

  // Réseaux sociaux
  'social_instagram_url',
  'social_pinterest_url',
  'social_youtube_url',

  // Newsletter — NewsletterForm lit ces clés via son accesseur local `cz()`.
  // Les six premières étaient déjà servies ; les suivantes manquaient, et le
  // composant affichait donc son fallback alors que le CMS avait une valeur.
  'newsletter_title',
  'newsletter_desc',
  'newsletter_placeholder',
  'newsletter_cta',
  'newsletter_success_title',
  'newsletter_success_subtext',
  'newsletter_badge',
  'newsletter_cta_loading',
  'newsletter_disclaimer',
  'newsletter_error_invalid',
  'newsletter_error_generic',
  'newsletter_error_network',

  // Encart Instagram (InstagramFeed) et CTA Travel Planning transverse
  // (CtaTravelPlanning) — même mécanisme d'accesseur local `val()`.
  'instagram_section_title',
  'instagram_cta_text',
  'cta_travel_planning_title',
  'cta_travel_planning_text',
  'cta_travel_planning_cta',

  // Menus : paires `<prefix>_<n>_label` / `<prefix>_<n>_url`, cf. getZoneLinks()
  ...buildLinkKeys('nav_item', 7),
  ...buildLinkKeys('footer_dest_item', 5),
  ...buildLinkKeys('footer_guide_item', 3),
  ...buildLinkKeys('footer_legal_item', 3),
]

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
      .in('zone_key', CONSUMED_ZONE_KEYS)

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
