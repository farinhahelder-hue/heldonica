/**
 * Réglages de cadrage d'une zone image, pilotés depuis le CMS.
 *
 * Une zone `image` lit trois zones compagnes, toutes optionnelles :
 *   - `<zone>_fit`      : `cover` ou `contain` (liste fermée) ;
 *   - `<zone>_ratio`    : `16/9`, `4/3`, `1/1`… (format contrôlé) ;
 *   - `<zone>_position` : `top`, `center`, `50% 20%`… (jetons en liste fermée).
 *
 * Pourquoi valider ici et pas dans le composant : ces valeurs finissent dans un
 * attribut `style`. Une chaîne libre saisie dans le CMS serait injectée telle
 * quelle dans la page. Le composant se contente donc d'appliquer un résultat
 * déjà validé, et la validation est couverte par des tests unitaires.
 *
 * Rien n'est écrit en dur : une zone absente ou invalide ne produit aucune
 * propriété, et l'image se rend exactement comme avant l'ajout de ces clés.
 */

/** Jetons acceptés pour `object-position`. Liste fermée, alignée sur les valeurs CSS usuelles. */
const POSITION_TOKENS = new Set([
  'top', 'bottom', 'left', 'right', 'center',
  '0%', '10%', '20%', '25%', '30%', '40%', '50%', '60%', '70%', '75%', '80%', '90%', '100%',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
])

const RATIO_RE = /^\d{1,3}\s*[/:]\s*\d{1,3}$/

export interface ImageAdjustment {
  aspectRatio?: string
  objectPosition?: string
  objectFit?: 'cover' | 'contain'
}

/** Normalise un ratio (`16:9` et `16 / 9` sont acceptés, le CSS veut `16 / 9`). */
export function normalizeRatio(raw: string | undefined): string | undefined {
  const value = raw?.trim()
  if (!value || !RATIO_RE.test(value)) return undefined
  return value.replace(/\s*[/:]\s*/, ' / ')
}

/** Valide un `object-position` : au plus deux jetons, chacun dans la liste fermée. */
export function normalizePosition(raw: string | undefined): string | undefined {
  const value = raw?.trim()
  if (!value) return undefined
  const tokens = value.split(/\s+/)
  if (tokens.length > 2 || !tokens.every((t) => POSITION_TOKENS.has(t))) return undefined
  return value
}

/** Valide un `object-fit` : seuls `cover` et `contain` sont retenus. */
export function normalizeFit(raw: string | undefined): 'cover' | 'contain' | undefined {
  const value = raw?.trim()
  return value === 'cover' || value === 'contain' ? value : undefined
}

/**
 * Construit les propriétés de style d'une image à partir des valeurs de ses
 * zones compagnes. Les clés absentes du résultat ne sont pas appliquées.
 */
export function buildImageAdjustment(
  zones: Record<string, string>,
  page: string,
  zone: string,
  fallbackFit?: 'cover' | 'contain'
): ImageAdjustment {
  const ratio = normalizeRatio(zones[`${page}__${zone}_ratio`])
  const position = normalizePosition(zones[`${page}__${zone}_position`])
  const fit = normalizeFit(zones[`${page}__${zone}_fit`]) ?? fallbackFit

  return {
    ...(ratio ? { aspectRatio: ratio } : {}),
    ...(position ? { objectPosition: position } : {}),
    ...(fit ? { objectFit: fit } : {}),
  }
}
