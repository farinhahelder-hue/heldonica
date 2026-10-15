/**
 * sync-brand-voice — tient lib/brand.py aligné sur lib/brand-voice.ts.
 *
 * lib/brand-voice.ts est la source de vérité. lib/brand.py en est le miroir
 * Python, utilisé par les scripts Python (génération d'articles, bot, nettoyage
 * de contenu). Rien ne garantissait qu'ils disent la même chose : le garde-fou
 * `check:brand-sync` était documenté dans AGENTS.md mais son script n'avait
 * jamais été committé — il ne tournait donc jamais.
 *
 * Ce script extrait la liste des mots bannis du TypeScript et la réécrit dans
 * le bloc balisé de lib/brand.py. Le reste du fichier Python (pronoms,
 * checklist, prompt) est éditorial et reste à la main.
 *
 * Usage :
 *   node scripts/sync-brand-voice.mjs           # réécrit lib/brand.py
 *   node scripts/sync-brand-voice.mjs --check   # ne réécrit pas, exit 1 si décalage
 */

import { readFileSync, writeFileSync } from 'node:fs';

export const TS_FILE = 'lib/brand-voice.ts';
export const PY_FILE = 'lib/brand.py';

const DEBUT = '# BEGIN GENERATED — scripts/sync-brand-voice.mjs';
const FIN = '# END GENERATED';

/** Mots bannis lus dans lib/brand-voice.ts, dans l'ordre du fichier. */
export function extraireMotsBannisTS(ts = readFileSync(TS_FILE, 'utf8')) {
  const bloc = ts.match(/export const FORBIDDEN_WORDS\s*=\s*\[([\s\S]*?)\]\s*as const;/);
  if (!bloc) throw new Error('FORBIDDEN_WORDS introuvable dans ' + TS_FILE);

  const mots = [];
  for (const m of bloc[1].matchAll(/'((?:\\.|[^'\\])*)'/g)) {
    // Le TypeScript échappe les apostrophes : 'n\'attendez plus'.
    mots.push(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
  }
  if (mots.length === 0) throw new Error('FORBIDDEN_WORDS vide — extraction suspecte.');
  return mots;
}

/** Bloc Python généré, prêt à insérer entre les balises. */
export function blocPython(mots) {
  const lignes = mots.map((m) => `    ${JSON.stringify(m)},`);
  return [
    DEBUT,
    'FORBIDDEN_WORDS = [',
    ...lignes,
    ']',
    FIN,
  ].join('\n');
}

/** Contenu de lib/brand.py avec le bloc généré remplacé. */
export function appliquerBloc(py, bloc) {
  const re = new RegExp(
    DEBUT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + FIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  if (!re.test(py)) throw new Error(`Balises ${DEBUT} … ${FIN} introuvables dans ${PY_FILE}`);
  return py.replace(re, bloc);
}

function main() {
  const check = process.argv.includes('--check');
  const attendu = appliquerBloc(readFileSync(PY_FILE, 'utf8'), blocPython(extraireMotsBannisTS()));
  const actuel = readFileSync(PY_FILE, 'utf8');

  if (actuel === attendu) {
    console.log('✓ lib/brand.py est à jour (mots bannis alignés sur lib/brand-voice.ts).');
    process.exit(0);
  }
  if (check) {
    console.log('✗ lib/brand.py diverge de lib/brand-voice.ts.');
    console.log('  Corriger : node scripts/sync-brand-voice.mjs');
    process.exit(1);
  }
  writeFileSync(PY_FILE, attendu);
  console.log('✓ lib/brand.py réécrit depuis lib/brand-voice.ts.');
}

if (process.argv[1] && process.argv[1].endsWith('sync-brand-voice.mjs')) main();
