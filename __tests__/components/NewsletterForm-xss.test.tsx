import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import SiteContentProvider from '@/components/SiteContentProvider'
import NewsletterForm from '@/components/NewsletterForm'

/**
 * Preuve de rendu, pas seulement de la fonction utilitaire.
 *
 * `components/NewsletterForm.tsx` injectait le titre de la section newsletter
 * via `dangerouslySetInnerHTML` sans assainissement. La valeur vient de la zone
 * CMS `newsletter_heading_blog` : modifiable depuis l'administration, elle
 * pouvait donc porter une balise `<script>` ou un attribut `onerror`.
 *
 * Reprend la PR #564, dont la branche portait en plus des stubs `return null`
 * sur trois composants réels — stubs volontairement non repris ici.
 */
function rendre(valeur: string) {
  return render(
    <SiteContentProvider
      zones={{ newsletter_heading_blog: { value: valeur } as never }}
      settings={{}}
    >
      <NewsletterForm variant="blog" />
    </SiteContentProvider>
  )
}

describe('NewsletterForm — assainissement du titre CMS', () => {
  it('retire une balise <script> injectée par la zone CMS', () => {
    const { container } = rendre('Titre sûr<script>alert("XSS")</script>')
    const html = container.innerHTML

    expect(html).not.toContain('<script>')
    expect(html).not.toContain('alert("XSS")')
    expect(html).toContain('Titre sûr')
  })

  it('retire un gestionnaire d\'événement onerror', () => {
    const { container } = rendre('<img src="x" onerror="alert(1)" />')
    const html = container.innerHTML

    expect(html).not.toContain('onerror')
    expect(html).not.toContain('alert(1)')
  })

  it('conserve le HTML éditorial légitime (retour à la ligne <br>)', () => {
    const { container } = rendre("Ce qu'on a vraiment trouvé,<br />directement dans ta boîte mail")
    const html = container.innerHTML

    expect(html).toContain('<br>')
    expect(container.textContent).toContain("Ce qu'on a vraiment trouvé,")
  })
})
