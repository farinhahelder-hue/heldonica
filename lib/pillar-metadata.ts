import type { Metadata } from 'next'
import type { PillarData } from './pillar-types'
import { SITE_URL, DEFAULT_OG_IMAGE } from './seo'
import { isUnpublishedPath } from './unpublished-pages'

export function buildPillarMetadata(d: PillarData): Metadata {
  // Une page pilier « Bientôt » (cf. lib/unpublished-pages.ts) sort de l'index et
  // sert l'image de partage par défaut : sa `hero` est justement ce qui la rend
  // non publiable (fonds Madère intégralement généré par IA). Sans ce garde, la
  // page restait indexable et l'image générée partait en og:image.
  const nonPubliable = isUnpublishedPath(`/destinations/${d.slug}`)

  return {
    title: d.seoTitle,
    description: nonPubliable
      ? 'Bientôt sur Heldonica : ce guide de destination est en préparation, à partir de notre vécu sur place.'
      : d.seoDesc,
    alternates: { canonical: `${SITE_URL}/destinations/${d.slug}` },
    robots: nonPubliable ? { index: false, follow: true } : undefined,
    openGraph: {
      title: d.seoTitle,
      description: nonPubliable
        ? 'Bientôt sur Heldonica : ce guide de destination est en préparation, à partir de notre vécu sur place.'
        : d.seoDesc,
      url: `${SITE_URL}/destinations/${d.slug}`,
      images: nonPubliable
        ? [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${d.name} — bientôt sur Heldonica` }]
        : [{ url: d.hero, width: 1200, height: 630, alt: `${d.name} slow travel — Heldonica` }],
      locale: 'fr_FR', type: 'website',
    },
  }
}
