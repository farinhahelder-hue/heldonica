import type { Metadata } from 'next'
import type { PillarData } from './pillar-types'
import { SITE_URL } from './seo'

export function buildPillarMetadata(d: PillarData): Metadata {
  return {
    title: d.seoTitle,
    description: d.seoDesc,
    alternates: { canonical: `${SITE_URL}/destinations/${d.slug}` },
    openGraph: {
      title: d.seoTitle,
      description: d.seoDesc,
      url: `${SITE_URL}/destinations/${d.slug}`,
      images: [{ url: d.hero, width: 1200, height: 630, alt: `${d.name} slow travel — Heldonica` }],
      locale: 'fr_FR', type: 'website',
    },
  }
}
