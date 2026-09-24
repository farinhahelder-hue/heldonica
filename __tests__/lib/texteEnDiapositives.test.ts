import { describe, it, expect } from 'vitest'
import { texteEnDiapositives } from '@/app/panel-manager/carousel/texteEnDiapositives'

/**
 * Le découpage vient de l'ancien éditeur de carrousels, remplacé par celui-ci.
 * C'est le seul apport qu'il avait : ces tests fixent son comportement pour que
 * le remplacement ne perde rien.
 */

let n = 0
const id = () => `d${++n}`

describe('texteEnDiapositives', () => {
  it('ouvre une diapositive sur une ligne numérotée, et lui donne le corps qui suit', () => {
    n = 0
    const d = texteEnDiapositives(
      '1. Les portes en bois\nÀ Maramureș, chaque cour en a une, sculptée par le grand-père.\n2. Le train de 4h15\nOn part avant le jour, dans le froid qui pique les doigts.',
      id
    )
    expect(d).toHaveLength(2)
    expect(d[0].title).toBe('Les portes en bois')
    expect(d[0].content).toContain('chaque cour en a une')
    expect(d[1].title).toBe('Le train de 4h15')
  })

  it('traite une ligne courte comme un titre, sans numérotation', () => {
    n = 0
    const d = texteEnDiapositives(
      'Le marché\nOn y arrive à sept heures, quand les étals sortent encore de la nuit et que personne ne parle fort.',
      id
    )
    expect(d).toHaveLength(1)
    expect(d[0].title).toBe('Le marché')
  })

  it('garde un titre sans corps — souvent une accroche', () => {
    // L'ancienne version exigeait titre ET corps : coller une liste de titres ne
    // produisait alors aucune diapositive.
    n = 0
    const d = texteEnDiapositives('Premier arrêt\nDeuxième arrêt\nTroisième arrêt', id)
    expect(d).toHaveLength(3)
    expect(d.map(x => x.title)).toEqual(['Premier arrêt', 'Deuxième arrêt', 'Troisième arrêt'])
  })

  it('découpe par paragraphes un texte d’un seul bloc, sans ligne courte', () => {
    n = 0
    const longue = 'A'.repeat(80)
    const d = texteEnDiapositives(`${longue}\n\n${longue}`, id)
    expect(d).toHaveLength(2)
    expect(d[0].title).toBe('')
    expect(d[0].content).toBe(longue)
  })

  it('ne rend rien pour un texte vide', () => {
    n = 0
    expect(texteEnDiapositives('', id)).toEqual([])
    expect(texteEnDiapositives('   \n  \n', id)).toEqual([])
  })

  it('donne un identifiant distinct à chaque diapositive', () => {
    n = 0
    const d = texteEnDiapositives('Un\nDeux\nTrois', id)
    expect(new Set(d.map(x => x.id)).size).toBe(3)
  })
})
