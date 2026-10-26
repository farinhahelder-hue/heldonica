/**
 * Traduction des réglages de cadrage d'une photo (saisis dans l'admin) en
 * écritures de zones CMS.
 *
 * Une zone `image` ne porte pas son cadrage : celui-ci vit dans trois zones
 * compagnes (`<zone>_fit`, `<zone>_ratio`, `<zone>_position`), lues au rendu par
 * `EditableZone` via `lib/image-adjustment.ts`. Ce module fait le pont entre le
 * formulaire d'admin et ces trois lignes — il valide chaque valeur **avant**
 * l'écriture, avec les mêmes règles que le rendu, pour qu'une saisie refusée
 * soit signalée à l'utilisateur au lieu d'être silencieusement ignorée.
 *
 * Les trois écritures sont toujours produites, y compris pour un champ vidé :
 * vider un champ doit **retirer** le réglage. On écrit alors `is_active = false`,
 * qui est la convention du projet pour désactiver une zone sans la supprimer.
 */
import { normalizeFit, normalizePosition, normalizeRatio } from './image-adjustment'

export const FRAMING_SUFFIXES = ['fit', 'ratio', 'position'] as const
export type FramingSuffix = (typeof FRAMING_SUFFIXES)[number]

export interface ImageFraming {
  fit: string
  ratio: string
  position: string
}

export const EMPTY_FRAMING: ImageFraming = { fit: '', ratio: '', position: '' }

export interface FramingWrite {
  page: string
  zone_key: string
  zone_type: 'text'
  value: string
  is_active: boolean
}

/** Clé de la zone compagne portant `suffix` pour la zone image `zoneKey`. */
export function companionKey(zoneKey: string, suffix: FramingSuffix): string {
  return `${zoneKey}_${suffix}`
}

/**
 * Lit les trois zones compagnes d'une image telles qu'elles existent, pour
 * préremplir le formulaire. Les clés absentes donnent une chaîne vide.
 */
export function readFraming(
  zones: Record<string, { value?: string }>,
  page: string,
  zoneKey: string
): ImageFraming {
  const read = (suffix: FramingSuffix) =>
    zones[`${page}__${companionKey(zoneKey, suffix)}`]?.value?.trim() ?? ''
  return { fit: read('fit'), ratio: read('ratio'), position: read('position') }
}

/**
 * Valide les trois réglages et produit les écritures correspondantes.
 *
 * Une valeur vide désactive le réglage (`is_active = false`). Une valeur non
 * vide mais refusée par la validation ne produit aucune écriture et remonte une
 * erreur lisible : on préfère ne rien écrire plutôt que d'enregistrer un cadrage
 * qui ne s'appliquera pas.
 */
export function buildFramingWrites(
  page: string,
  zoneKey: string,
  framing: ImageFraming
): { writes: FramingWrite[]; errors: string[] } {
  const writes: FramingWrite[] = []
  const errors: string[] = []

  const regles: Array<{ suffix: FramingSuffix; label: string; vide: string; valider: (v: string) => string | undefined }> = [
    { suffix: 'fit', label: 'Remplissage', vide: 'cover', valider: normalizeFit },
    { suffix: 'ratio', label: 'Proportions', vide: '16 / 9', valider: normalizeRatio },
    { suffix: 'position', label: 'Cadrage', vide: 'center', valider: normalizePosition },
  ]

  for (const regle of regles) {
    const brut = framing[regle.suffix]?.trim() ?? ''

    if (!brut) {
      writes.push({
        page,
        zone_key: companionKey(zoneKey, regle.suffix),
        zone_type: 'text',
        value: '',
        is_active: false,
      })
      continue
    }

    const valide = regle.valider(brut)
    if (!valide) {
      errors.push(`${regle.label} : « ${brut} » n'est pas accepté (ex. ${regle.vide}).`)
      continue
    }

    writes.push({
      page,
      zone_key: companionKey(zoneKey, regle.suffix),
      zone_type: 'text',
      value: valide,
      is_active: true,
    })
  }

  return { writes, errors }
}
