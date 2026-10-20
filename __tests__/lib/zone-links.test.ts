import { describe, it, expect, vi } from 'vitest'

// Le hook importe le contexte du site ; seul getZoneLinks est testé ici.
vi.mock('@/components/SiteContentProvider', () => ({ useSiteContent: () => null }))

import { getZoneLinks } from '@/hooks/useContentLoader'
import type { CmsZone } from '@/lib/content-loader'

const zones = (entries: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(entries).map(([k, value]) => [k, { zone_key: k, value } as unknown as CmsZone])
  )

/**
 * Le pied de page menait à « Grèce — Bientôt », page vide, depuis chaque page
 * du site (relevé du 19/10/2026).
 */
describe('getZoneLinks', () => {
  it('ne garde aucun lien vers une page non publiable', () => {
    const links = getZoneLinks(
      'footer_dest_item',
      [],
      zones({
        footer_dest_item_1_label: 'Madère',
        footer_dest_item_1_url: '/destinations/madere',
        footer_dest_item_2_label: 'Grèce',
        footer_dest_item_2_url: '/destinations/grece',
      })
    )
    expect(links).toEqual([{ label: 'Madère', url: '/destinations/madere' }])
  })

  it('filtre aussi le fallback', () => {
    const links = getZoneLinks(
      'footer_dest_item',
      [
        { label: 'Roumanie', url: '/destinations/roumanie' },
        { label: 'Grèce', url: 'https://www.heldonica.fr/destinations/grece/' },
      ],
      {}
    )
    expect(links).toEqual([{ label: 'Roumanie', url: '/destinations/roumanie' }])
  })
})
