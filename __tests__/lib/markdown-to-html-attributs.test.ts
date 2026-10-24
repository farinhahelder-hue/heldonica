import { describe, it, expect } from 'vitest'
import { markdownToHtml } from '@/lib/markdown-to-html'

/**
 * Relevé du 24/10/2026 : cinq articles portaient du JSX (`className=`) dans leur
 * `content`, dont un publié (`/blog/itineraire-slow-travel-roumanie-bucarest-apuseni`,
 * `<img className="w-full rounded-lg my-6 shadow-md" />`). Le contenu passe par
 * `markdownToHtml` puis `sanitizeHtml`, donc la classe était perdue côté client
 * (DOMPurify retire un attribut `className` inconnu) et servie telle quelle côté
 * serveur.
 */
describe('markdownToHtml — attributs JSX', () => {
  it('convertit className en class dans un contenu déjà en HTML', () => {
    const source = '<img src="x.jpg" alt="y" className="w-full rounded-lg my-6 shadow-md" />'
    expect(markdownToHtml(source)).toBe('<img src="x.jpg" alt="y" class="w-full rounded-lg my-6 shadow-md" />')
  })

  it('convertit className dans un tableau HTML', () => {
    const source = '<table className="w-full text-sm my-6 border-collapse"><tbody><tr><td>x</td></tr></tbody></table>'
    const html = markdownToHtml(source)
    expect(html).toContain('<table class="w-full text-sm my-6 border-collapse">')
    expect(html).not.toContain('className')
  })

  it('laisse intact un contenu HTML sans attribut JSX', () => {
    const source = '<p class="lead">Deja du HTML</p><h2>Titre</h2>'
    expect(markdownToHtml(source)).toBe(source)
  })

  it('ne convertit rien dans du markdown pur', () => {
    const html = markdownToHtml('## Un titre\n\nUn texte.')
    expect(html).not.toContain('class')
  })
})
