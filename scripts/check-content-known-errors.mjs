#!/usr/bin/env node
/**
 * check-content-known-errors — garde-fou des fautes connues **dans le code**.
 *
 * Pourquoi ce script existe
 * -------------------------
 * Le 25/10/2026, les migrations `20261018235500` et `20261019120000` ont corrigé
 * « Évoramonsaraz », « agritourismes », « propietario » en base. Le lendemain, la
 * page `/destinations/alentejo` servait **toujours** « Évoramonsaraz » : la même
 * faute vivait aussi dans **4 replis JSX**, dont le tableau `FAQS` qui alimente le
 * **JSON-LD FAQPage** lu par Google.
 *
 * Cause : les garde-fous existants contrôlent la **base** (`check:content-coherence`)
 * ou la prose de **quelques dossiers** (`check:content-pages`). Aucun ne connaît la
 * liste des fautes déjà corrigées ailleurs. Une faute corrigée en base restait donc
 * visible dans le code.
 *
 * Ce qu'il fait — et ce qu'il ne fait pas
 * ---------------------------------------
 * Une seule chose : chercher les **fautes connues** (`FAUTES_CONNUES`), des chaînes de
 * langue fautives déjà corrigées en base, dans **tout** le code du dépôt.
 *
 * Les mots bannis et les emojis ne sont **pas** refaits ici : ils ont leurs contrôles
 * dédiés (`check:content-pages`, `check:design-tics`), plus fins, avec des périmètres
 * réfléchis. Les re-scanner largement produisait 197 faux positifs (l'admin
 * `MediaLibrary`, la liste de mots bannis de `cms-brand-linter`, les données de
 * référence). Un contrôle qui crie au loup est un contrôle qu'on désactive.
 *
 * Pourquoi une liste curée et non une extraction des migrations
 * ------------------------------------------------------------
 * L'extraction automatique des couples faute → correction depuis
 * `supabase/migrations/*.sql` a été **essayée puis rejetée** : sur les 202 migrations,
 * elle produit ~200 couples dont l'immense majorité ne sont pas des fautes de langue.
 * Les migrations contiennent aussi des **noms de colonnes** (`hero_title`, `bio_text`),
 * des **valeurs d'état** (`published` → `draft`), des **slugs légitimes** (`madere` →
 * `grece`, alors que `/destinations/madere` est une URL valide) et des **clés de zone**.
 * Les chercher dans le code produisait **1 029 signalements**, tous faux.
 *
 * La liste est donc maintenue à la main, chaque entrée portant sa migration d'origine.
 * Ajouter une faute ici est un geste volontaire, pas un effet de bord.
 *
 * Périmètre : tout le code `.ts`/`.tsx` du dépôt, sauf les tests (fautes à dessein).
 *
 * Usage : node scripts/check-content-known-errors.mjs
 * Sortie : exit 1 dès la première faute connue trouvée.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Chaînes de langue fautives, déjà corrigées en base, interdites dans le code.
 * Chaque entrée porte la migration qui a posé la correction : la source de vérité
 * reste la base, ce contrôle n'est que le rappel côté code.
 */
export const FAUTES_CONNUES = [
  // Lot 2 (2026-10-25) — trouvé en ligne alors que la base était déjà corrigée.
  { faute: 'Évoramonsaraz', correction: 'Évora et Monsaraz', source: '20261018235500' },
  { faute: 'agritourismes', correction: 'agritourisme', source: '20261018235500' },
  { faute: 'propietario', correction: 'propriétaire', source: '20261019120000' },
  { faute: 'viñedos', correction: 'vignobles', source: '20261019120000' },
  { faute: 'Fagnes blanches', correction: 'Falaises blanches', source: '20261019120000' },
  { faute: 'falaises bretonnes', correction: 'falaises normandes', source: '20261019120000' },
  // Correction de cohérence en ligne (2026-10-23).
  { faute: 'préparée devant on,', correction: 'préparée devant nous,', source: '20261023120000' },
];

const RACINES = ['.'];

// Les tests contiennent des fautes **à dessein** (jeux d'essai de régression) :
// les refuser interdirait d'écrire un test. C'est la seule exclusion.
const EXCLUS = ['__tests__', 'node_modules', '.next', '.git', '.audit', '.openhands'];

function estExclu(chemin) {
  const rel = chemin.replace(/\\/g, '/');
  return EXCLUS.some((e) => rel.split('/').includes(e));
}

function fichiers(racine, acc = []) {
  let st;
  try {
    st = statSync(racine);
  } catch {
    return acc;
  }
  if (st.isFile()) {
    if (/\.(ts|tsx)$/.test(racine) && !estExclu(racine)) acc.push(racine);
    return acc;
  }
  for (const e of readdirSync(racine)) {
    if (estExclu(e)) continue;
    fichiers(join(racine, e), acc);
  }
  return acc;
}

// Une ligne de commentaire ne s'affiche pas : la citer n'est pas la commettre.
function estCommentaire(ligne) {
  const t = ligne.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*');
}

const problemes = [];

function juger(fichier, numero, texte) {
  const t = texte.trim();
  for (const { faute, correction, source } of FAUTES_CONNUES) {
    if (t.includes(faute)) {
      problemes.push({
        fichier,
        numero,
        type: 'faute connue',
        detail: `« ${faute} » (corrigée en base par ${source}) — attendu : « ${correction} »`,
      });
    }
  }
}

// Littéraux de chaîne, un par un : c'est là que vivent les textes émis.
const CHAINE_RE = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g;

let fichiersScannes = 0;
for (const fichier of RACINES.flatMap((r) => fichiers(r))) {
  fichiersScannes++;
  const source = readFileSync(fichier, 'utf8');
  source.split('\n').forEach((ligne, i) => {
    if (estCommentaire(ligne)) return;
    for (const m of ligne.matchAll(CHAINE_RE)) {
      juger(fichier, i + 1, m[2]);
    }
  });
}

if (problemes.length > 0) {
  console.error(
    `\n✗ check-content-known-errors : ${problemes.length} faute(s) connue(s) dans le code, sur ${fichiersScannes} fichiers scannés.\n`
  );
  for (const p of problemes.slice(0, 60)) {
    console.error(`  - ${p.fichier}:${p.numero} [${p.type}] ${p.detail}`);
  }
  if (problemes.length > 60) console.error(`  ... et ${problemes.length - 60} autre(s).`);
  console.error(
    "\n  Rappel : corriger la base ne corrige pas le repli du code (et l'inverse).\n" +
      '  Une faute de langue vit souvent aux deux endroits.\n'
  );
  process.exit(1);
}

console.log(
  `✓ check-content-known-errors : ${fichiersScannes} fichiers — ${FAUTES_CONNUES.length} faute(s) connue(s) suivie(s), 0 présente dans le code.`
);
process.exit(0);
