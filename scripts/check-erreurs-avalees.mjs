#!/usr/bin/env node
/**
 * Garde-fou : une écriture en base dont l'erreur n'est jamais lue.
 *
 * Supabase ne lève pas. Il rend `{ data, error }`. Écrire
 *
 *     const { data } = await sb.from('t').insert({...})
 *
 * compile, passe les types, et perd silencieusement l'échec : `data` vaut null,
 * la suite continue, et l'appelant annonce une réussite. Cinq bugs de cette
 * forme ont été trouvés à la main le 3 septembre 2026, chacun caché par le
 * précédent :
 *
 *   - mobile-publish, file Instagram — « brouillon + Instagram créé » alors que
 *     seul l'article existait, la table n'ayant jamais été créée.
 *   - mobile-publish, point de carte — même motif, une fonction plus haut.
 *   - ScheduledPostsList — « Aucun post programmé » quand la requête échouait.
 *   - MainActivity, position — SecurityException avalée par un catch vide.
 *   - MainActivity, Nominatim — NetworkOnMainThreadException, idem.
 *
 * Le symptôme est toujours le même : « rien ne se passe », ou pire, « c'est
 * fait » alors que rien n'est fait. C'est ce qui coûte le plus cher à
 * diagnostiquer, parce qu'il n'y a aucune trace à lire.
 *
 * Ce que ce script ne fait pas : juger ce qu'on fait de l'erreur. Il vérifie
 * qu'elle est nommée, pas qu'elle est bien traitée.
 */

import fs from 'node:fs'
import path from 'node:path'

const RACINES = ['app', 'lib', 'components', 'scripts']
const EXTENSIONS = new Set(['.ts', '.tsx', '.mjs'])

/** Les écritures : une erreur y est bien plus coûteuse qu'une lecture ratée. */
const ECRITURES = /\.(insert|update|upsert|delete|rpc)\s*\(/

/**
 * Une déstructuration de résultat Supabase, avec ce qu'elle nomme.
 * Exemples : `const { data } =`, `const { data: ig, error } =`.
 */
const DESTRUCTURATION = /const\s*\{([^}]*)\}\s*=\s*await\b/g

const EXCEPTIONS = new Map([
  // Aucune pour l'instant. Une entrée ici doit dire pourquoi l'échec peut être ignoré.
])

function fichiers(dossier) {
  const out = []
  if (!fs.existsSync(dossier)) return out
  for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '__pycache__') continue
    const p = path.join(dossier, e.name)
    if (e.isDirectory()) out.push(...fichiers(p))
    else if (EXTENSIONS.has(path.extname(e.name))) out.push(p)
  }
  return out
}

/**
 * Fin de l'expression `await` : on suit les parenthèses jusqu'à retomber à zéro,
 * puis jusqu'au bout de la chaîne. Une fenêtre de taille fixe confondait une
 * lecture avec l'écriture qui la suivait quelques lignes plus bas.
 */
function finExpression(source, debut) {
  let profondeur = 0
  let i = debut
  let vuOuverture = false

  for (; i < source.length; i++) {
    const c = source[i]
    if (c === '(') { profondeur++; vuOuverture = true }
    else if (c === ')') {
      profondeur--
      if (vuOuverture && profondeur === 0) {
        // La chaîne peut continuer : .select().single(), .eq(...)…
        // La fenêtre doit franchir un retour à la ligne et son indentation :
        // avec deux caractères, `(sb as any)\n  .from(...)` passait pour finie,
        // et l'écriture qui suivait n'était jamais vue.
        const suite = source.slice(i + 1, i + 60)
        if (/^\s*\./.test(suite)) continue
        return i + 1
      }
    } else if (c === ';' && profondeur === 0 && vuOuverture) return i
  }
  return Math.min(source.length, debut + 600)
}

const trouves = []
const MOI = 'scripts/check-erreurs-avalees.mjs'

for (const racine of RACINES) {
  for (const chemin of fichiers(racine)) {
    const fichier = chemin.split(path.sep).join('/')
    if (fichier === MOI) continue
    const source = fs.readFileSync(chemin, 'utf8')
    const lignes = source.split(/\r?\n/)

    let m
    DESTRUCTURATION.lastIndex = 0
    while ((m = DESTRUCTURATION.exec(source)) !== null) {
      const nommes = m[1]
      // `error` nommé, sous quelque alias que ce soit : l'échec est visible.
      if (/\berror\b/.test(nommes)) continue
      // Une déstructuration qui ne prend pas `data` n'est pas un résultat Supabase.
      if (!/\bdata\b/.test(nommes)) continue

      // L'expression exacte, parenthèses équilibrées.
      const suite = source.slice(m.index, finExpression(source, m.index))
      if (!ECRITURES.test(suite)) continue
      if (!/\.from\s*\(|supabase|\bsb\b/.test(suite)) continue

      const ligne = source.slice(0, m.index).split(/\r?\n/).length
      const cle = `${fichier}:${ligne}`
      if (EXCEPTIONS.has(cle)) continue

      trouves.push({ cle, extrait: (lignes[ligne - 1] || '').trim().slice(0, 96) })
    }
  }
}

if (trouves.length === 0) {
  console.log("✓ Toute écriture en base lit son erreur.")
  process.exit(0)
}

console.error(`✗ ${trouves.length} écriture(s) dont l'erreur n'est jamais lue :\n`)
for (const t of trouves) {
  console.error('    ' + t.cle)
  console.error('      ' + t.extrait)
}
console.error(
  "\n  Supabase ne lève pas : il rend { data, error }. Sans nommer `error`, un\n" +
  "  échec devient un `data` null, et l'appelant annonce une réussite.\n" +
  "  Nomme-la et fais-en quelque chose — au minimum un console.error."
)
process.exit(1)
