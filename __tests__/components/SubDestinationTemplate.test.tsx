import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// EditableZone porte Tiptap, l'IA d'amélioration et la médiathèque : hors sujet
// ici. On rend son `fallback`, ce qui est exactement ce qu'un visiteur voit
// quand la zone CMS est absente — le cas des pages non publiables.
vi.mock('@/components/inline-edit/EditableZone', () => ({
  default: ({ fallback }: { fallback?: React.ReactNode }) => <>{fallback}</>,
}))

// NewsletterForm interroge Supabase au montage : sans rapport avec le rendu.
vi.mock('@/components/NewsletterForm', () => ({
  default: () => <form data-testid="newsletter" />,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import SubDestinationTemplate from '@/components/SubDestinationTemplate'

const highlights = [{ emoji: '🏛️', title: 'Le théâtre', description: 'Grec.' }]

/**
 * Le brouillon en base de ces pages est un fragment (« Grec. »). Le gabarit doit
 * servir une page « Bientôt » à la place — même état de non-publication que
 * /destinations/grece — pour qu'aucun contenu de brouillon ne soit publié.
 */
describe('SubDestinationTemplate — pages non publiables', () => {
  it('sert une page « Bientôt » pour une page du registre, sans le brouillon', () => {
    render(
      <SubDestinationTemplate
        page="destinations-sicile-taormine"
        name="Taormine"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="/og-default.jpg"
        introText="Taormine, c'est le spot tourism. Incredible."
        highlights={highlights}
        localTip="Conseil."
      />
    )

    expect(screen.getByText('Taormine')).toBeInTheDocument()
    expect(screen.getByText('Sicile — Bientôt')).toBeInTheDocument()
    // Le nom garde sa majuscule (« le guide taormine » auparavant).
    expect(screen.getByText('On prépare le guide Taormine — à notre façon.')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter')).toBeInTheDocument()
    // Le contenu de brouillon ne doit pas être servi.
    expect(screen.queryByText(/Incredible/)).not.toBeInTheDocument()
    expect(screen.queryByText(/spot tourism/)).not.toBeInTheDocument()
  })

  // Bucarest : sous-page restée en ligne au MVP du 18/10 (photo vérifiée) ;
  // Funchal, l'ancien exemple, est passée en « Bientôt ».
  it('sert le contenu normal pour une page publiée', () => {
    render(
      <SubDestinationTemplate
        page="destinations-roumanie-bucarest"
        name="Bucarest"
        parentName="Roumanie"
        parentSlug="roumanie"
        heroImage="/og-default.jpg"
        introText="La capitale côtière et ses ruelles fleuries, à parcourir à pied."
        highlights={highlights}
        localTip="Descendre tôt au marché pour les fleurs."
      />
    )

    expect(
      screen.getByText(/La capitale côtière et ses ruelles fleuries/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/Bientôt/)).not.toBeInTheDocument()
  })
})
