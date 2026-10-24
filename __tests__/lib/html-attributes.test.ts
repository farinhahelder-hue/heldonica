import { describe, it, expect } from 'vitest'
import { normalizeHtmlAttributes } from '@/lib/html-attributes'

/**
 * Relevé du 24/10/2026 : du JSX (`className=`) était stocké en base et servi tel
 * quel par `dangerouslySetInnerHTML`. Le navigateur ignore un attribut
 * `className`, donc la classe Tailwind ne s'appliquait jamais — la couleur
 * voulue disparaissait sans erreur. Relevé sur `destinations-alentejo`
 * (intro_1/2, quick_1/4), `destinations-montenegro-kotor` (×12), `home`
 * (section_quiz_title), et cinq articles de blog dont un publié.
 */
describe('normalizeHtmlAttributes', () => {
  it('convertit className en class', () => {
    expect(normalizeHtmlAttributes('<strong className="text-stone-900">x</strong>')).toBe(
      '<strong class="text-stone-900">x</strong>'
    )
  })

  it('convertit les deux sortes de guillemets', () => {
    expect(normalizeHtmlAttributes("<em className='text-eucalyptus'>x</em>")).toBe(
      "<em class='text-eucalyptus'>x</em>"
    )
    expect(normalizeHtmlAttributes('<em className=text-eucalyptus>x</em>')).toBe(
      '<em class=text-eucalyptus>x</em>'
    )
  })

  it('convertit toutes les occurrences d\'une valeur', () => {
    const entree = '<p className="a">x</p><span className="b">y</span>'
    expect(normalizeHtmlAttributes(entree)).toBe('<p class="a">x</p><span class="b">y</span>')
  })

  it('ne touche pas un attribut class deja correct', () => {
    const entree = '<p class="text-charcoal/85">x</p>'
    expect(normalizeHtmlAttributes(entree)).toBe(entree)
  })

  it('ne touche pas un mot qui se termine par className', () => {
    const entree = '<p data-myclassName="x">y</p>'
    expect(normalizeHtmlAttributes(entree)).toBe(entree)
  })

  it('laisse intact un texte sans attribut', () => {
    expect(normalizeHtmlAttributes('Une phrase simple.')).toBe('Une phrase simple.')
  })
})
