import { describe, it, expect } from 'vitest'
import { captionSansEmoji } from '@/lib/instagram'

/**
 * La file `instagram_scheduled_posts` contient des brouillons hérités portant le
 * format `📍 <ville> … 🌍 <url>` (09/2026), et `publierEntreeFile` publie la
 * légende **stockée** telle quelle. Sans ce filtre, valider un ancien brouillon
 * depuis le panneau enverrait les emojis sur le compte — la charte « carnet »
 * (décision #682) les interdit. Ces cas sont les légendes **réelles** de la base
 * au 24/10.
 */
describe('captionSansEmoji', () => {
  it('retire les repères d’une légende héritée et ne laisse pas de blanc', () => {
    const brut = '📍 Timișoara\n[À TOI]\n🌍 heldonica.fr/blog/timisoara-938451\n#slowtravel #heldonica'
    expect(captionSansEmoji(brut)).toBe(
      'Timișoara\n[À TOI]\nheldonica.fr/blog/timisoara-938451\n#slowtravel #heldonica'
    )
  })

  it('supprime une ligne qui ne portait qu’un emoji', () => {
    const brut = 'On a déambulé dans les ruelles.\n\n📍\n🌍 heldonica.fr/blog/carnet-mobile-215101\n#slowtravel'
    const attendu = 'On a déambulé dans les ruelles.\n\nheldonica.fr/blog/carnet-mobile-215101\n#slowtravel'
    expect(captionSansEmoji(brut)).toBe(attendu)
  })

  it('retire les emojis en milieu de phrase sans toucher au texte', () => {
    expect(captionSansEmoji('Titre 🏦✨ avec emojis.')).toBe('Titre avec emojis.')
  })

  it('retire les drapeaux (Regional Indicator Symbols)', () => {
    expect(captionSansEmoji('🇵🇹 Portugal en tête')).toBe('Portugal en tête')
  })

  it('laisse intacte une légende sans emoji', () => {
    const propre = 'Un texte normal sans emoji.\n\nDeuxième paragraphe.'
    expect(captionSansEmoji(propre)).toBe(propre)
  })

  it('nettoie la légende complète héritée (pin, globe et lien)', () => {
    const brut = "📍 CuiB d'Arte à Timișoara : Cour intérieure\ndans Timișoara, on a découvert cette cour ! 🏦✨\n🌍 heldonica.fr\n🔗 heldonica.fr/blog/cuib-darte"
    const attendu = "CuiB d'Arte à Timișoara : Cour intérieure\ndans Timișoara, on a découvert cette cour !\nheldonica.fr\nheldonica.fr/blog/cuib-darte"
    expect(captionSansEmoji(brut)).toBe(attendu)
  })

  it('gère une légende vide', () => {
    expect(captionSansEmoji('')).toBe('')
  })
})
