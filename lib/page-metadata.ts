/**
 * Métadonnées SEO pilotées par le CMS.
 *
 * Les pages statiques déclarent un objet `metadata` en fallback (valeur
 * actuelle, affichée tant qu'aucune zone n'est publiée) puis appellent
 * `buildPageMetadata` depuis `generateMetadata`. Les zones suivantes sont
 * lues dans `cms_editable_zones` :
 *   - `seo_title`       : title + openGraph.title + twitter.title
 *   - `seo_description` : description + openGraph.description + twitter.description
 *   - `seo_og_image`    : openGraph.images (et twitter si non précisé)
 *
 * La canonical et la structure (robots, keywords…) restent codées en dur :
 * ce sont des décisions de site, pas du contenu éditorial.
 */

import type { Metadata } from 'next'
import { getPageZones } from '@/lib/cms-zones'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'

/**
 * Description servie par une page non publiable. Sans elle, la balise
 * description et l'aperçu de partage (WhatsApp, Facebook) montraient le texte
 * du brouillon généré (« Est. Theatre grec, vue mer… ») alors que la page
 * affiche « Bientôt ».
 */
export const DESCRIPTION_BIENTOT =
  'Bientôt sur Heldonica : ce carnet de route est en préparation, à partir de notre vécu sur place.'

export async function buildPageMetadata(
  page: string,
  fallback: Metadata
): Promise<Metadata> {
  const zones = await getPageZones(page)
  const nonPubliable = isUnpublishedCmsPage(page)
  const title = zones[`${page}__seo_title`]
  // Page non publiable : jamais la description du brouillon (zone ou fallback).
  const description = nonPubliable ? DESCRIPTION_BIENTOT : zones[`${page}__seo_description`]
  const image = zones[`${page}__seo_og_image`]
  // Page non publiable : l'image de partage par défaut, jamais la photo de la
  // zone ni celle du fallback. Une page est « Bientôt » faute de photo
  // vérifiée ; /destinations/idf/paris partageait la tour Eiffel de stock, et
  // le fallback de Kotor est moraca_millennium, écartée.
  const images = nonPubliable
    ? [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }]
    : image
      ? [{ url: image, width: 1200, height: 630 }]
      : undefined

  // Contenu non publiable : la page reste consultable mais sort de l'index
  // (cf. lib/unpublished-pages.ts). Les robots déclarés par la page sont
  // conservés ; seul l'index passe à false.
  const robots = nonPubliable
    ? {
        ...(fallback.robots && typeof fallback.robots === 'object' ? fallback.robots : {}),
        index: false,
        follow: true,
      }
    : fallback.robots

  return {
    ...fallback,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(robots ? { robots } : {}),
    openGraph: {
      ...(fallback.openGraph ?? {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(images ? { images } : {}),
    },
    twitter: fallback.twitter
      ? {
          ...fallback.twitter,
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
          ...(nonPubliable ? { images: [DEFAULT_OG_IMAGE] } : {}),
        }
      : undefined,
  }
}
