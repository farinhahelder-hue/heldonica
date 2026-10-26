/**
 * Ce qu'une zone `global` a le droit de publier.
 *
 * Le 25/10/2026, la liste blanche `CONSUMED_ZONE_KEYS` a été retirée de
 * `getGlobalZones()` : elle obligeait à modifier le code pour chaque zone créée
 * depuis le CMS, ce qui interdisait au propriétaire d'ajouter une entrée de menu
 * sans développeur. Mais elle portait aussi une précaution réelle — ne pas
 * sérialiser dans le HTML public une valeur qu'aucun composant n'affiche. C'est
 * l'incident des résidus « Monica Schneider / Executive Coach » d'un ancien
 * projet, restés lisibles par Googlebot.
 *
 * Le remplacement n'est donc pas « plus de filtre » mais « un filtre déclaré ».
 * Toute zone `global` active doit être **explicitement** publique :
 *   - soit son préfixe est listé dans `publicPrefixes` (ou la clé exacte dans
 *     `publicKeys`) — elle est servie ;
 *   - soit elle porte le préfixe réservé `privatePrefix` (`_prive_`) — elle est
 *     écartée du rendu, quoi qu'il arrive.
 *
 * Une zone qui n'entre dans aucun des deux cas fait échouer
 * `scripts/check-cms-zones.mjs` : on ne la publie pas en silence.
 *
 * La déclaration vit dans un JSON, seule forme lisible à la fois par ce module
 * et par le script `.mjs` (qui ne peut pas importer de TypeScript).
 */

import declaration from './public-global-zones.json'

export interface PublicGlobalZonesDeclaration {
  privatePrefix: string
  publicPrefixes: string[]
  publicKeys: string[]
}

const { privatePrefix, publicPrefixes, publicKeys } = declaration as PublicGlobalZonesDeclaration

export { privatePrefix, publicPrefixes, publicKeys }

/**
 * Zone réservée, jamais rendue. Le préfixe `_prive_` place la clé hors de toute
 * famille publique et sert de convention d'exclusion explicite : un brouillon, un
 * résidu d'ancien projet, ou une valeur gardée en base pour archive.
 */
export function isPrivateZone(zoneKey: string): boolean {
  return zoneKey.startsWith(privatePrefix)
}

/** Zone déclarée publiable : préfixe de famille reconnu, ou clé exacte listée. */
export function isPublicGlobalZone(zoneKey: string): boolean {
  if (isPrivateZone(zoneKey)) return false
  if (publicKeys.includes(zoneKey)) return true
  return publicPrefixes.some((p) => zoneKey.startsWith(p))
}
