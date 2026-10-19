import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'

const getSettings = vi.fn()

vi.mock('@/lib/settings', () => ({
  getSettings: (...keys: string[]) => getSettings(...keys),
}))

import SiteTheme from '@/components/SiteTheme'

function styleContent(container: HTMLElement): string {
  return container.querySelector('style')?.textContent || ''
}

describe('SiteTheme — polices', () => {
  beforeEach(() => {
    cleanup()
    getSettings.mockReset()
  })

  it('laisse les polices de marque gouverner et ne charge pas Google Fonts', async () => {
    getSettings.mockResolvedValue({ font_heading: 'Fraunces', font_body: 'Source Sans 3' })

    const { container } = render(await SiteTheme())
    const css = styleContent(container)

    expect(css).toContain('--font-heading: var(--font-heading-brand')
    expect(css).toContain('--font-body: var(--font-body-brand')
    expect(container.querySelector('link[rel="stylesheet"]')).toBeNull()
  })

  it('neutralise une variante CMS de la police de marque', async () => {
    getSettings.mockResolvedValue({ font_heading: 'Fraunces Variable' })

    const { container } = render(await SiteTheme())

    expect(styleContent(container)).toContain('--font-heading: var(--font-heading-brand')
    expect(container.querySelector('link[rel="stylesheet"]')).toBeNull()
  })

  it('charge uniquement la police choisie dans le CMS', async () => {
    getSettings.mockResolvedValue({ font_heading: 'Lora', font_body: 'Inter' })

    const { container } = render(await SiteTheme())
    const link = container.querySelector('link[rel="stylesheet"]')
    const css = styleContent(container)

    expect(link?.getAttribute('href')).toContain('family=Lora')
    expect(link?.getAttribute('href')).toContain('family=Inter')
    expect(css).toContain('--font-heading: Lora, serif')
    expect(css).toContain('--font-body: Inter, sans-serif')
  })
})
