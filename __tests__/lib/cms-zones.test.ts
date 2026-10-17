import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isPlaceholderZoneValue, getPageZones } from '@/lib/cms-zones'

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/cms-targeting', () => ({
  getTargetedZoneVariants: vi.fn().mockResolvedValue({}),
}))

import { createServiceClient } from '@/lib/supabase'

describe('isPlaceholderZoneValue', () => {
  it('identifies null and undefined as placeholder values', () => {
    expect(isPlaceholderZoneValue(null)).toBe(true)
    expect(isPlaceholderZoneValue(undefined)).toBe(true)
  })

  it('identifies empty strings and whitespace as placeholder values', () => {
    expect(isPlaceholderZoneValue('')).toBe(true)
    expect(isPlaceholderZoneValue('   ')).toBe(true)
  })

  it('identifies og-default.jpg variants as placeholder values', () => {
    expect(isPlaceholderZoneValue('/og-default.jpg')).toBe(true)
    expect(isPlaceholderZoneValue('og-default.jpg')).toBe(true)
    expect(isPlaceholderZoneValue('https://www.heldonica.fr/og-default.jpg')).toBe(true)
    expect(isPlaceholderZoneValue('${SITE_URL}/og-default.jpg')).toBe(true)
  })

  it('returns false for actual valid content and photo URLs', () => {
    expect(isPlaceholderZoneValue('/images/destinations/madere/achadas_da_cruz.jpg')).toBe(false)
    expect(
      isPlaceholderZoneValue(
        'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg'
      )
    ).toBe(false)
    expect(isPlaceholderZoneValue('Bienvenue sur notre guide')).toBe(false)
  })
})

describe('getPageZones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters out null and placeholder values from returned zone map', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { page: 'test-page', zone_key: 'hero_title', value: 'Un vrai titre' },
            { page: 'test-page', zone_key: 'hero_image', value: '/og-default.jpg' },
            { page: 'test-page', zone_key: 'empty_zone', value: '   ' },
            { page: 'test-page', zone_key: 'null_zone', value: null },
          ],
          error: null,
        }),
      }),
    })

    vi.mocked(createServiceClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    } as any)

    const zones = await getPageZones('test-page')

    expect(zones).toEqual({
      'test-page__hero_title': 'Un vrai titre',
    })
    expect(zones['test-page__hero_image']).toBeUndefined()
  })
})
