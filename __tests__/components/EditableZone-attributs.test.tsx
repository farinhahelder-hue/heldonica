import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import EditableZone from '@/components/inline-edit/EditableZone'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'

/**
 * Preuve de rendu, pas seulement de la fonction utilitaire.
 *
 * Relevé du 24/10/2026 : `/destinations/alentejo` servait en clair
 * `<strong className="text-stone-900">La première fois</strong>`. Un navigateur
 * ignore un attribut `className` : la couleur voulue était absente, sans erreur.
 */
function rendre(valeur: string) {
  return render(
    <InlineEditProvider page="destinations-alentejo" initialZones={{ 'destinations-alentejo__intro_1': valeur }}>
      <EditableZone page="destinations-alentejo" zone="intro_1" type="html" fallback="Repli." />
    </InlineEditProvider>
  )
}

describe('EditableZone — attributs JSX servis par le CMS', () => {
  it('sert class et non className dans le HTML rendu', () => {
    const { container } = rendre('<strong className="text-stone-900">La première fois</strong>, on a traversé.')
    const html = container.innerHTML
    expect(html).toContain('class="text-stone-900"')
    expect(html).not.toContain('className')
    expect(container.textContent).toBe('La première fois, on a traversé.')
  })

  it('corrige aussi le fallback codé en dur', () => {
    const { container } = render(
      <InlineEditProvider page="destinations-alentejo" initialZones={{}}>
        <EditableZone
          page="destinations-alentejo"
          zone="intro_1"
          type="html"
          fallback='<em className="text-eucalyptus">en 2 minutes</em>'
        />
      </InlineEditProvider>
    )
    expect(container.innerHTML).toContain('class="text-eucalyptus"')
    expect(container.innerHTML).not.toContain('className')
  })
})
