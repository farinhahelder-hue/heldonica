import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import EditableZone from '@/components/inline-edit/EditableZone'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'

/**
 * Preuve de rendu, pas seulement de la fonction utilitaire.
 *
 * Relevé du 20/10/2026 : `/guides/top-10-pepites-madere` servait en clair
 * « On a passé 3 semaines à Madère.\nVoici ce qu'on en a retiré. », et
 * `/guides/merci` « …prochaines minutes.\nPense à vérifier… ». La valeur en base
 * contenait les deux caractères `\` puis `n`, injectés tels quels par
 * `dangerouslySetInnerHTML`.
 */
function rendre(valeur: string) {
  return render(
    <InlineEditProvider page="top-10-pepites-madere" initialZones={{ 'top-10-pepites-madere__intro_title': valeur }}>
      <EditableZone page="top-10-pepites-madere" zone="intro_title" fallback="Repli." />
    </InlineEditProvider>
  )
}

describe('EditableZone — \\n littéral servi par le CMS', () => {
  it('convertit la séquence littérale en <br /> dans le HTML rendu', () => {
    const { container } = rendre("On a passé 3 semaines à Madère.\\nVoici ce qu'on en a retiré.")
    const html = container.innerHTML
    expect(html).toContain("<br>")
    expect(html).not.toContain('\\n')
    expect(container.textContent).toBe("On a passé 3 semaines à Madère.Voici ce qu'on en a retiré.")
  })

  it('rend le double \\n\\n en deux sauts', () => {
    const { container } = rendre("l'histoire de chaque plat.\\n\\nOn a testé.")
    expect(container.innerHTML).toContain("<br><br>")
    expect(container.innerHTML).not.toContain('\\n')
  })

  it('ne touche pas une valeur sans séquence', () => {
    const { container } = rendre('Une phrase simple.')
    expect(container.textContent).toBe('Une phrase simple.')
    expect(container.innerHTML).not.toContain("<br>")
  })
})
