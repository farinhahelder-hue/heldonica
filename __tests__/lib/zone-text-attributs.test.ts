import { describe, it, expect } from 'vitest'
import { normalizeZoneText } from '@/lib/zone-text'

/**
 * Relevé du 24/10/2026 : une zone CMS peut porter du JSX (`className=`) au lieu
 * de HTML. Le contenu passe par `dangerouslySetInnerHTML`, donc le navigateur
 * reçoit un attribut `className` qu'il ignore — la classe Tailwind ne s'applique
 * pas. La conversion se fait au même endroit que celle du `\n` littéral.
 */
describe('normalizeZoneText — attributs JSX', () => {
  it('convertit className en class dans une zone', () => {
    expect(normalizeZoneText('<strong className="text-eucalyptus">Mai-juin :</strong> agréable')).toBe(
      '<strong class="text-eucalyptus">Mai-juin :</strong> agréable'
    )
  })

  it('convertit className et la séquence \\n dans la même valeur', () => {
    expect(normalizeZoneText('<em className="text-eucalyptus">x</em>\\nSuite.')).toBe(
      '<em class="text-eucalyptus">x</em><br />Suite.'
    )
  })

  it('laisse intact un HTML déjà correct', () => {
    const entree = 'Mars–Juin<br /><span class="text-eucalyptus">Sept–Nov</span>'
    expect(normalizeZoneText(entree)).toBe(entree)
  })
})
