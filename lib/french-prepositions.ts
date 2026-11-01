/**
 * Prépositions françaises devant un lieu.
 *
 * Les gabarits écrivaient « à » devant tous les noms : « Quand partir à
 * Roumanie ? », « Où dormir à Monténégro ? ». C'est juste pour une ville ou une
 * île (« à Madère », « à Paris »), faux pour un pays (« en Roumanie », « au
 * Monténégro », « aux Pays-Bas »).
 *
 * Ce module est la source unique côté site : `DestinationPillar`,
 * `TestedByHeldonica` et les gabarits de réponses rapides passent par lui.
 * Il ne corrige que des lieux connus, donc « au bord de l'eau » ou « au lait »
 * restent intacts.
 */

export type FrenchPreposition = 'en' | 'au' | 'aux' | 'à'

/** Préposition française devant chaque destination connue. */
const DESTINATION_PREPOSITIONS: Record<string, FrenchPreposition> = {
  // Pays et régions féminins -> « en »
  France: 'en',
  Roumanie: 'en',
  Suisse: 'en',
  Italie: 'en',
  Espagne: 'en',
  Belgique: 'en',
  Grèce: 'en',
  Autriche: 'en',
  Irlande: 'en',
  Islande: 'en',
  Croatie: 'en',
  Slovénie: 'en',
  Hongrie: 'en',
  Pologne: 'en',
  Bulgarie: 'en',
  Lituanie: 'en',
  Lettonie: 'en',
  Estonie: 'en',
  Finlande: 'en',
  Norvège: 'en',
  Suède: 'en',
  Turquie: 'en',
  Tunisie: 'en',
  Égypte: 'en',
  Argentine: 'en',
  Bolivie: 'en',
  Colombie: 'en',
  Sicile: 'en',
  Sardaigne: 'en',
  Corse: 'en',
  Crète: 'en',
  Malte: 'en',
  Normandie: 'en',
  // Pays et régions masculins -> « au »
  Monténégro: 'au',
  Portugal: 'au',
  Canada: 'au',
  Maroc: 'au',
  Japon: 'au',
  Danemark: 'au',
  Luxembourg: 'au',
  Mexique: 'au',
  Brésil: 'au',
  Pérou: 'au',
  Vietnam: 'au',
  Cambodge: 'au',
  Laos: 'au',
  Kenya: 'au',
  Sénégal: 'au',
  Ghana: 'au',
  'Royaume-Uni': 'au',
  Québec: 'au',
  'Costa Rica': 'au',
  'Sri Lanka': 'au',
  // Pluriels -> « aux »
  'Pays-Bas': 'aux',
  'États-Unis': 'aux',
  'Émirats arabes unis': 'aux',
  Bahamas: 'aux',
  Philippines: 'aux',
  Maldives: 'aux',
  Seychelles: 'aux',
  Açores: 'aux',
  // Villes, îles et régions qui gardent « à »
  Madère: 'à',
  Paris: 'à',
  Lisbonne: 'à',
  Porto: 'à',
  Funchal: 'à',
  Zurich: 'à',
  Lucerne: 'à',
  Genève: 'à',
  Lausanne: 'à',
  Rome: 'à',
  Venise: 'à',
  Naples: 'à',
  Florence: 'à',
  Barcelone: 'à',
  Madrid: 'à',
  Séville: 'à',
  Londres: 'à',
  Berlin: 'à',
  Vienne: 'à',
  Prague: 'à',
  Budapest: 'à',
  Athènes: 'à',
  Istanbul: 'à',
  Marrakech: 'à',
  Tokyo: 'à',
  'New York': 'à',
  Montréal: 'à',
  Bruxelles: 'à',
  Marseille: 'à',
  Lyon: 'à',
  Bordeaux: 'à',
  Nice: 'à',
  Strasbourg: 'à',
  'Le Havre': 'à',
}

const LEADING_PREPOSITION = /^\s*(?:aux|au|en|à|a)\s+/i
const PREPOSITION_ALTERNATION = '(?:aux|au|en|à|a)'

/** Retire les accents sans toucher au reste du texte. */
export function stripAccents(text: string): string {
  return text
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalise(text: string): string {
  return stripAccents(text).toLowerCase().trim()
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function variantEntries(): [string, FrenchPreposition][] {
  const entries: [string, FrenchPreposition][] = []
  for (const [name, preposition] of Object.entries(DESTINATION_PREPOSITIONS)) {
    for (const variant of [name, stripAccents(name)]) {
      if (variant && !entries.some(([existing]) => existing === variant)) {
        entries.push([variant, preposition])
      }
    }
  }
  // Les formes les plus longues d'abord : « Costa Rica » avant « Rica ».
  return entries.sort((a, b) => b[0].length - a[0].length)
}

const VARIANTS = variantEntries()

const PRECOMPILED_PATTERNS = VARIANTS.map(([variant, preposition]) => ({
  pattern: new RegExp(
    `(^|[^\\p{L}])${PREPOSITION_ALTERNATION}\\s+(${escapeRegExp(variant)})(?![\\p{L}])`,
    'giu'
  ),
  preposition
}))

/** Préposition juste devant un lieu : « en », « au », « aux » ou « à ». */
export function prepositionForDestination(destination: string): FrenchPreposition {
  const name = destination.trim().replace(LEADING_PREPOSITION, '')
  if (!name) return 'à'
  if (/^les\s+/i.test(name)) return 'aux'
  const key = normalise(name)
  const found = VARIANTS.find(([variant]) => normalise(variant) === key)
  return found ? found[1] : 'à'
}

/** « Roumanie » -> « en Roumanie », « Madère » -> « à Madère ». */
export function inDestination(destination: string): string {
  const name = destination.trim().replace(LEADING_PREPOSITION, '').trim()
  if (!name) return destination.trim()
  return `${prepositionForDestination(name)} ${name}`
}

/**
 * Répare les gabarits : « à Roumanie » -> « en Roumanie ».
 * Ne touche qu'aux lieux connus, accents et casse ignorés.
 */
export function fixDestinationPrepositions(text: string): string {
  if (!text) return text
  let fixed = text.normalize('NFC')
  for (const { pattern, preposition } of PRECOMPILED_PATTERNS) {
    fixed = fixed.replace(pattern, (_match, before: string, name: string) => `${before}${preposition} ${name}`)
  }
  return fixed
}
