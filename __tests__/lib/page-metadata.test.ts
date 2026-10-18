import { describe, it, expect, vi } from 'vitest'

/**
 * Une page non publiable affiche « Bientôt » : sa balise description et son
 * aperçu de partage ne doivent pas servir le texte du brouillon généré.
 */
vi.mock('@/lib/cms-zones', () => ({
  getPageZones: async (page: string) => ({
    [`${page}__seo_description`]: 'Est. Theatre grec, vue mer en Sicile.',
    [`${page}__seo_title`]: 'Taormine',
  }),
}))

import { buildPageMetadata, DESCRIPTION_BIENTOT } from '@/lib/page-metadata'

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
})
