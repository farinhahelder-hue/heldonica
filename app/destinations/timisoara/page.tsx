import { permanentRedirect } from 'next/navigation'

/**
 * Timișoara existait à deux URL vivantes, avec deux contenus différents :
 *
 *   /destinations/timisoara           259 lignes, 46 zones — la vraie page
 *   /destinations/roumanie/timisoara   66 lignes, 14 zones — une coquille
 *
 * Duplication de contenu sur deux URL indexables, et incohérence de navigation :
 * toutes les autres villes roumaines (Brașov, Cluj, Bucarest) vivent sous
 * /destinations/roumanie/.
 *
 * Arbitrage : le contenu riche l'emporte, et il prend l'URL conventionnelle.
 * Cette route redirige donc vers la forme canonique.
 */
export default function TimisoaraRedirect() {
  permanentRedirect('/destinations/roumanie/timisoara')
}
