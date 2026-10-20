import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Le hero rend la description de la zone CMS. Avant le correctif, elle était
// coupée à 200 caractères avec un « ... » concaténé : /destinations/suisse et
// /destinations/zurich affichaient une phrase tronquée au milieu d'un mot.

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock('next/navigation', () => ({ notFound: vi.fn() }))

// EditableZone : on rend le fallback, ce que voit un visiteur sans zone CMS.
vi.mock('@/components/inline-edit/EditableZone', () => ({
  default: ({ fallback }: { fallback?: React.ReactNode }) => <>{fallback}</>,
}))
vi.mock('@/components/inline-edit/InlineEditProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/components/Header', () => ({ default: () => <header /> }))
vi.mock('@/components/Footer', () => ({ default: () => <footer /> }))
vi.mock('@/components/SlowTravelQuiz', () => ({ default: () => <div /> }))
vi.mock('@/components/RelatedArticles', () => ({ default: () => <div /> }))
vi.mock('@/components/seo/DestinationJsonLd', () => ({ default: () => null }))
vi.mock('@/lib/supabase-client', () => ({ supabase: null }))
vi.mock('@/lib/layout-helpers', () => ({
  getPageLayout: async () => [{ id: 'hero', label: 'Hero', active: true }],
}))
vi.mock('@/lib/pillar-data', () => ({ fetchSubDestinations: async () => [] }))
vi.mock('@/lib/cms-zones', () => ({ getPageZones: vi.fn() }))

import { getPageZones } from '@/lib/cms-zones'
import DestinationPage from '@/app/destinations/[slug]/DestinationPage'

// Valeur réelle de `destinations-suisse__description` (274 caractères).
const DESCRIPTION_COMPLETE =
  "Le funiculaire le plus raide du monde vers Stoos. Les crêtes à 2000m qu'on traverse en été avec des fleurs jusqu'aux genoux. Les bains du Lötschental, où l'on reste une heure de plus que prévu. La Suisse révèle ses meilleurs côtés à ceux qui descendent des sentiers balisés."

describe('DestinationPage — hero description', () => {
  it('affiche la description entière, sans coupe ni « ... » ajouté', async () => {
    vi.mocked(getPageZones).mockResolvedValue({
      'destinations-suisse__description': DESCRIPTION_COMPLETE,
    } as any)

    const ui = await DestinationPage({ slug: 'suisse' })
    render(ui as React.ReactElement)

    expect(DESCRIPTION_COMPLETE.length).toBeGreaterThan(200)
    // La fin de la phrase doit être présente : c'est elle que la coupe amputait.
    expect(
      screen.getByText(/descendent des sentiers balisés\./)
    ).toBeInTheDocument()
    // Aucun texte ne doit se terminer par un « ... » de troncature.
    expect(screen.queryByText(/\.\.\.$/)).not.toBeInTheDocument()
  })
})
