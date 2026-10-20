import { describe, it, expect } from 'vitest'
import { normalizeZoneText } from '@/lib/zone-text'

/**
 * Relevé du 20/10/2026 : `/guides/top-10-pepites-madere` et `/guides/merci`
 * affichaient « \n » en toutes lettres, la valeur en base contenant les deux
 * caractères plutôt qu'un retour à la ligne.
 */
describe('normalizeZoneText', () => {
  it('convertit la séquence littérale \\n en <br />', () => {
    expect(normalizeZoneText('chaque plat.\\n\\nOn a testé')).toBe('chaque plat.<br /><br />On a testé')
  })

  it('convertit un \\n en fin de ligne isolé', () => {
    expect(normalizeZoneText('prochaines minutes.\\nPense à vérifier ton dossier spam')).toBe(
      'prochaines minutes.<br />Pense à vérifier ton dossier spam'
    )
  })

  it('laisse intact un vrai retour à la ligne', () => {
    const avecVraiSaut = 'Une phrase.\nUne autre.'
    expect(normalizeZoneText(avecVraiSaut)).toBe(avecVraiSaut)
  })

  it('laisse intact le HTML déjà présent', () => {
    expect(normalizeZoneText('Mars–Juin<br /><span>Sept–Nov</span>')).toBe('Mars–Juin<br /><span>Sept–Nov</span>')
  })

  it('ne touche pas un texte sans séquence', () => {
    expect(normalizeZoneText('Une phrase simple.')).toBe('Une phrase simple.')
  })
})
