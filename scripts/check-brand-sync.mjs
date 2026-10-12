#!/usr/bin/env node
/**
 * check-brand-sync — vérifie la parité de la voix de marque TypeScript ↔ Python.
 *
 * lib/brand-voice.ts est la source de vérité. lib/brand.py en est le miroir
 * Python. AGENTS.md décrit ce contrôle (« la parité stricte de la voix de marque
 * TypeScript ↔ Python ») depuis des mois — mais le script n'avait jamais été
 * committé, donc rien ne tournait, et les deux listes pouvaient diverger en
 * silence.
 *
 * Ce qui est vérifié automatiquement :
 *   1. Le bloc généré de lib/brand.py est exactement celui que produirait
 *      scripts/sync-brand-voice.mjs depuis lib/brand-voice.ts (liste des mots
 *      bannis : contenu ET ordre).
 *   2. lib/brand.py s'importe réellement en Python et expose la même liste.
 *   3. Les pronoms stricts de lib/brand.py sont les valeurs canoniques
 *      (on / tu / vous) et la liste des interdits est celle du prompt maître.
 *
 * Ce qui n'est PAS vérifié : l'extraction des pronoms depuis le texte du prompt
 * TypeScript. Un changement de formulation du prompt ne sera pas détecté ici.
 *
 * Usage : node scripts/check-brand-sync.mjs
 * Sortie : exit 1 si la moindre divergence.
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extraireMotsBannisTS, blocPython, appliquerBloc, TS_FILE, PY_FILE } from './sync-brand-voice.mjs';

const PRONOMS_ATTENDUS = { duo: 'on', lecteur_b2c: 'tu', pro_b2b: 'vous' };
const INTERDITS_ATTENDUS = ['je', 'nous', 'les voyageurs', 'les touristes'];

const erreurs = [];

// ── 1. Le bloc généré de lib/brand.py correspond-il à la source TypeScript ? ──
const ts = readFileSync(TS_FILE, 'utf8');
const py = readFileSync(PY_FILE, 'utf8');
const attendu = appliquerBloc(py, blocPython(extraireMotsBannisTS(ts)));

if (py !== attendu) {
  erreurs.push(
    `${PY_FILE} diverge de ${TS_FILE} : le bloc généré n'est pas à jour.\n` +
    '    Corriger : node scripts/sync-brand-voice.mjs'
  );
}

// ── 2. lib/brand.py s'importe-t-il, et expose-t-il la même liste ? ────────────
const motsTS = extraireMotsBannisTS(ts);
let pyData = null;
const sonde = spawnSync(
  'python3',
  [
    '-c',
    [
      'import json, importlib.util',
      "spec = importlib.util.spec_from_file_location('brand', 'lib/brand.py')",
      "mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)",
      'print(json.dumps({"words": list(mod.FORBIDDEN_WORDS), "pronoms": mod.PRONOMS}))',
    ].join('\n'),
  ],
  { encoding: 'utf8' }
);

if (sonde.status !== 0) {
  erreurs.push(
    `${PY_FILE} ne s'importe pas en Python (python3 absent ou erreur de syntaxe).\n` +
    `    ${(sonde.stderr || '').trim().split('\n').slice(-1)[0] || 'raison inconnue'}`
  );
} else {
  pyData = JSON.parse(sonde.stdout);

  if (pyData.words.length !== motsTS.length || pyData.words.some((w, i) => w !== motsTS[i])) {
    erreurs.push(
      `Liste des mots bannis divergente : ${motsTS.length} côté TypeScript, ` +
      `${pyData.words.length} côté Python.`
    );
  }

  // ── 3. Pronoms canoniques ──────────────────────────────────────────────────
  for (const [cle, val] of Object.entries(PRONOMS_ATTENDUS)) {
    if (pyData.pronoms?.[cle] !== val) {
      erreurs.push(`Pronom « ${cle} » = ${JSON.stringify(pyData.pronoms?.[cle])}, attendu « ${val} ».`);
    }
  }
  const interdits = pyData.pronoms?.interdits ?? [];
  if (interdits.length !== INTERDITS_ATTENDUS.length ||
      INTERDITS_ATTENDUS.some((p) => !interdits.includes(p))) {
    erreurs.push(`Pronoms interdits = ${JSON.stringify(interdits)}, attendu ${JSON.stringify(INTERDITS_ATTENDUS)}.`);
  }
}

if (erreurs.length) {
  console.log('✗ Voix de marque désynchronisée :');
  for (const e of erreurs) console.log(`  - ${e}`);
  process.exit(1);
}

console.log(
  `✓ Voix de marque synchronisée : ${motsTS.length} mots bannis identiques ` +
  `(${TS_FILE} ↔ ${PY_FILE}), pronoms on/tu/vous conformes.`
);
process.exit(0);
