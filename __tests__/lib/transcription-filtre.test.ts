import { describe, it, expect } from 'vitest'
import { estInvente, normaliser } from '@/lib/transcription-filtre'

/**
 * Ce test importe la règle qu'il vérifie. Une version qui la réimplémenterait
 * ne prouverait rien : c'est exactement ce qui a laissé passer l'hallucination.
 */

/** Un segment que Whisper juge sûr : parole nette, texte vraisemblable. */
function sur(texte: string) {
  return { texte, probaSilence: 0.05, vraisemblance: -0.3 }
}

describe('estInvente', () => {
  describe('les génériques de sous-titrage', () => {
    it("écarte celui qui a été gravé dans un montage", () => {
      // Le cas réel, observé le 6 septembre 2026 sur un plan sans parole.
      expect(estInvente(sur('Sous-titres par Jérémy Diaz'))).toBe(true)
    })

    it('écarte ses variantes de casse et d’accent', () => {
      expect(estInvente(sur('SOUS-TITRAGE RÉALISÉ PAR LA COMMUNAUTÉ'))).toBe(true)
      expect(estInvente(sur('sous titres traduits par un bénévole'))).toBe(true)
      expect(estInvente(sur('Sous-titrage effectué par le studio'))).toBe(true)
    })

    it('écarte les sites de sous-titrage, où qu’ils soient cités', () => {
      expect(estInvente(sur("Sous-titres réalisés par la communauté d'Amara.org"))).toBe(true)
      expect(estInvente(sur('❤️ par SousTitreur.com'))).toBe(true)
    })

    it('garde une vraie phrase qui parle de sous-titres', () => {
      // Le motif est ancré au début pour cette raison : quelqu'un peut
      // mentionner des sous-titres sans que ce soit un générique.
      expect(estInvente(sur("j'ai mis des sous-titres par-dessus la vidéo"))).toBe(false)
      expect(estInvente(sur('on va ajouter des sous-titres pour la version anglaise'))).toBe(false)
    })
  })

  describe('les indicateurs de confiance', () => {
    it('écarte un segment que Whisper juge muet et invraisemblable', () => {
      expect(estInvente({ texte: 'Bonjour', probaSilence: 0.9, vraisemblance: -1.5 })).toBe(true)
    })

    it('garde une parole étouffée : la probabilité de silence seule ne suffit pas', () => {
      expect(estInvente({ texte: 'Bonjour', probaSilence: 0.9, vraisemblance: -0.4 })).toBe(false)
    })

    it('garde un mot rare ou accentué : la vraisemblance seule ne suffit pas', () => {
      expect(estInvente({ texte: 'Kaysersberg', probaSilence: 0.1, vraisemblance: -1.5 })).toBe(
        false
      )
    })

    it('garde ce qui est juste aux deux seuils, sans les franchir', () => {
      expect(estInvente({ texte: 'Bonjour', probaSilence: 0.6, vraisemblance: -1.0 })).toBe(false)
    })
  })

  it('garde une phrase ordinaire de carnet de voyage', () => {
    expect(estInvente(sur('on est arrivés au bord du lac juste avant le coucher du soleil'))).toBe(
      false
    )
  })
})

describe('normaliser', () => {
  it('retire les accents, la casse et ce qui précède le texte', () => {
    expect(normaliser('  ❤️ Éléphant')).toBe('elephant')
  })
})
