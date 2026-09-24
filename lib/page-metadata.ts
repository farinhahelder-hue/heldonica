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

export async function buildPageMetadata(
  page: string,
  fallback: Metadata
): Promise<Metadata> {
  const zones = await getPageZones(page)
  const title = zones[`${page}__seo_title`]
  const description = zones[`${page}__seo_description`]
  const image = zones[`${page}__seo_og_image`]

  return {
    ...fallback,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    openGraph: {
      ...(fallback.openGraph ?? {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: fallback.twitter
      ? {
          ...fallback.twitter,
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
        }
      : undefined,
  }
}
