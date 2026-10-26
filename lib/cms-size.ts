/**
 * Conversion d'une valeur de taille saisie dans le CMS en pixels CSS.
 *
 * Le logo (`header_logo_width` / `header_logo_height`) est le premier réglage
 * de dimension piloté depuis le CMS. Sa valeur finit dans un attribut `style` :
 * une chaîne libre casserait la mise en page, voire injecterait du CSS. On
 * n'accepte donc qu'un entier positif raisonnable, écrit en chiffres.
 *
 * Une valeur refusée ne produit rien : le repli écrit dans le composant reste
 * la référence, et le logo se rend comme avant.
 */

/** Borne haute : au-delà, la valeur est une erreur de saisie, pas un logo. */
const MAX_PX = 400

export function parseCssPx(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  const n = Number.parseInt(trimmed, 10)
  // `String(n) !== trimmed` écarte « 40px », « 40.5 », « +40 » et « 040 » :
  // seule une écriture entière simple est acceptée.
  if (!Number.isFinite(n) || n <= 0 || n > MAX_PX || String(n) !== trimmed) return undefined

  return `${n}px`
}
