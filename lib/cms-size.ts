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

/** Ce que l'en-tête montre du logo : le sceau, le nom, ou les deux. */
export type LogoDisplay = 'both' | 'icon' | 'text'

export const LOGO_DISPLAYS: readonly LogoDisplay[] = ['both', 'icon', 'text']

/**
 * Réglage `header_logo_display` : « emplacement » du logo dans l'en-tête.
 *
 * Le sceau et le nom sont écrits dans le composant ; ce réglage dit lesquels
 * montrer. Liste fermée — toute autre valeur retombe sur `both`, l'état actuel
 * du site : une faute de saisie ne doit pas faire disparaître le logo.
 */
export function parseLogoDisplay(value: string | undefined): LogoDisplay {
  const trimmed = value?.trim().toLowerCase()
  return (LOGO_DISPLAYS as readonly string[]).includes(trimmed ?? '')
    ? (trimmed as LogoDisplay)
    : 'both'
}
