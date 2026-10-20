import { describe, it, expect, vi } from 'vitest'

/**
 * Une page non publiable affiche « Bientôt » : sa balise description et son
 * aperçu de partage ne doivent pas servir le texte du brouillon généré.
 */
vi.mock('@/lib/cms-zones', () => ({
  getPageZones: async (page: string) => ({
    [`${page}__seo_description`]: 'Est. Theatre grec, vue mer en Sicile.',
    [`${page}__seo_title`]: 'Taormine',
    [`${page}__seo_og_image`]: 'https://cdn.example/photo-de-la-zone.jpg',
  }),
}))

import { buildPageMetadata, DESCRIPTION_BIENTOT } from '@/lib/page-metadata'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'

const fallback = {
  description: 'Est. Theatre grec, vue mer en Sicile.',
  openGraph: { description: 'Est. Theatre grec, vue mer en Sicile.' },
  twitter: { card: 'summary_large_image' as const, description: 'Est. Theatre grec' },
}

describe('buildPageMetadata', () => {
  it('page non publiable : description « Bientôt » partout, noindex', async () => {
    const m = await buildPageMetadata('destinations-sicile-taormine', fallback)
    expect(m.description).toBe(DESCRIPTION_BIENTOT)
    expect((m.openGraph as { description?: string }).description).toBe(DESCRIPTION_BIENTOT)
    expect((m.twitter as { description?: string }).description).toBe(DESCRIPTION_BIENTOT)
    expect(m.robots).toMatchObject({ index: false, follow: true })
  })

  it('page publiée : la description de la zone CMS est servie', async () => {
    const m = await buildPageMetadata('destinations-madere', fallback)
    expect(m.description).toBe('Est. Theatre grec, vue mer en Sicile.')
  })

  // /destinations/idf/paris partageait la tour Eiffel de stock de sa zone
  // seo_og_image, Maramureș une photo qui n'est pas du Maramureș.
  it("page non publiable : image de partage par défaut, pas la photo de la zone", async () => {
    const m = await buildPageMetadata('destinations-idf-paris', {
      ...fallback,
      openGraph: { ...fallback.openGraph, images: ['/images/autre-endroit.jpg'] },
    })
    expect((m.openGraph as { images?: { url: string }[] }).images).toEqual([
      { url: DEFAULT_OG_IMAGE, width: 1200, height: 630 },
    ])
    expect((m.twitter as { images?: string[] }).images).toEqual([DEFAULT_OG_IMAGE])
  })

  it("page publiée : l'image de la zone seo_og_image est servie", async () => {
    const m = await buildPageMetadata('destinations-madere', fallback)
    expect((m.openGraph as { images?: { url: string }[] }).images?.[0].url).toBe(
      'https://cdn.example/photo-de-la-zone.jpg'
    )
  })
})
