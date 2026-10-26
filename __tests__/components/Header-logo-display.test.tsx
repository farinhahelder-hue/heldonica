import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ user: null, loading: false }),
}))

// Les zones sont la seule chose qui varie d'un cas à l'autre. `getCmsOrSetting`
// et `getZoneLinks` restent réels : c'est leur cascade qu'on veut exercer.
const zonesRef: { current: Record<string, unknown> } = { current: {} }

vi.mock('@/hooks/useContentLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useContentLoader')>()
  return {
    ...actual,
    useContentLoader: () => ({ zones: zonesRef.current, settings: {} }),
  }
})

import Header from '@/components/Header'

const SEAL = 'svg[viewBox="-69.5 0 341 341"]'
const NAME = 'Heldonica'

function withDisplay(value?: string) {
  zonesRef.current = value === undefined
    ? {}
    : { 'header_logo_display': { value } }
}

beforeEach(() => {
  zonesRef.current = {}
})

describe('Header — emplacement du logo', () => {
  it('montre le sceau ET le nom quand aucun réglage n’existe (état actuel)', () => {
    withDisplay(undefined)
    const { container } = render(<Header />)
    expect(container.querySelector(SEAL)).toBeInTheDocument()
    expect(container.textContent).toContain(NAME)
  })

  it('« icon » n’affiche que le sceau', () => {
    withDisplay('icon')
    const { container } = render(<Header />)
    expect(container.querySelector(SEAL)).toBeInTheDocument()
    expect(container.textContent).not.toContain(NAME)
  })

  it('« text » n’affiche que le nom', () => {
    withDisplay('text')
    const { container } = render(<Header />)
    expect(container.querySelector(SEAL)).not.toBeInTheDocument()
    expect(container.textContent).toContain(NAME)
  })

  it('retombe sur les deux pour une valeur inconnue — le logo ne disparaît jamais', () => {
    withDisplay('logo')
    const { container } = render(<Header />)
    expect(container.querySelector(SEAL)).toBeInTheDocument()
    expect(container.textContent).toContain(NAME)
  })
})
