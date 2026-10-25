import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import ArticlePreview from '@/components/admin/ArticlePreview'

/**
 * Preuve de rendu, pas seulement de la fonction utilitaire.
 *
 * `components/admin/ArticlePreview.tsx` injectait `content` directement via
 * `dangerouslySetInnerHTML`. Le contenu vient de `cms_blog_posts.content`, écrit
 * depuis le CMS (et, pour partie, importé de WordPress) : une balise `<script>`
 * ou un attribut `onerror` qui s'y trouve s'exécutait dans l'aperçu.
 *
 * Reprend la PR #560, dont la branche portait en plus des stubs `return null`
 * sur trois composants réels — stubs volontairement non repris ici.
 */
function rendre(content: string) {
  return render(
    <ArticlePreview open={true} title="Titre" content={content} onClose={() => {}} />
  )
}

describe('ArticlePreview — assainissement du HTML injecté', () => {
  it('retire une balise <script> du contenu', () => {
    const { container } = rendre('<p>Texte sûr</p><script>alert("XSS")</script>')
    const html = container.innerHTML

    expect(html).not.toContain('<script>')
    expect(html).not.toContain('alert("XSS")')
    expect(html).toContain('Texte sûr')
  })

  it('retire un gestionnaire d\'événement onerror', () => {
    const { container } = rendre('<img src="x" onerror="alert(1)" />')
    const html = container.innerHTML

    expect(html).not.toContain('onerror')
    expect(html).not.toContain('alert(1)')
  })

  it('conserve le HTML éditorial légitime', () => {
    const { container } = rendre('<p>Un paragraphe <strong>important</strong>.</p>')
    const html = container.innerHTML

    expect(html).toContain('<strong>important</strong>')
    expect(container.textContent).toContain('Un paragraphe important.')
  })
})
