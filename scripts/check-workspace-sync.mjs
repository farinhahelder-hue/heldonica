#!/usr/bin/env node
/**
 * check-workspace-sync — l'espace de travail est-il sain avant de toucher au code ?
 *
 * AGENTS.md le place en tête du pré-vol (`npm run preflight`). Deux familles de
 * problèmes y sont attrapées, toutes deux déjà survenues :
 *
 *   1. La branche locale est en retard sur origin/main. C'est ce qui produit les
 *      réinventions de code et les régressions : on repart d'un état périmé sans
 *      le savoir.
 *   2. Des modules critiques manquent. Le 10/10, commit a48552a, huit fichiers
 *      référencés par le code n'ont jamais été committés — ils existaient sur la
 *      machine de l'auteur et nulle part ailleurs. Ce contrôle-là les voit
 *      immédiatement, sans compilation.
 *
 * Ce qu'il ne fait pas : il ne remplace ni `tsc`, ni les tests, ni
 * check:cms-migrations. Il vérifie l'état du dépôt, pas sa validité.
 *
 * Usage :
 *   node scripts/check-workspace-sync.mjs            # pré-vol complet
 *   node scripts/check-workspace-sync.mjs --preflight # idem, sans le fetch réseau
 *
 * Sortie : exit 1 si un module critique manque ; un retard de branche est un
 * avertissement (souvent légitime en cours de travail), pas un échec.
 */

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/**
 * Fichiers dont l'absence casse le build ou l'administration.
 * Un fichier retiré volontairement doit sortir de cette liste dans le même
 * commit — sinon la liste devient un mensonge, et on finit par l'ignorer.
 */
export const CRITIQUES = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tsconfig.json',
  'middleware.ts',
  'lib/brand-voice.ts',
  'lib/brand.py',
  'lib/supabase.ts',
  'lib/supabase-client.ts',
  'lib/cms-auth.ts',
  'lib/cms-zones.ts',
  'app/layout.tsx',
];

function git(...args) {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function main() {
  const problemes = [];
  const avertissements = [];

  // ── 1. Modules critiques ────────────────────────────────────────────────────
  const manquants = CRITIQUES.filter((f) => !existsSync(f));
  if (manquants.length) {
    problemes.push(
      `${manquants.length} module(s) critique(s) absent(s) :\n` +
      manquants.map((f) => `      ${f}`).join('\n')
    );
  }

  // ── 2. Synchronisation avec origin/main ─────────────────────────────────────
  const branche = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (branche && branche !== 'HEAD') {
    // Le fetch est fait dans les deux modes : sans lui, on comparerait à une
    // référence périmée et le contrôle ne verrait pas un commit arrivé entre
    // deux exécutions. Il reste rapide (< 1 s), et un échec réseau n'est pas
    // traité comme une dérive.
    git('fetch', '--quiet', 'origin', 'main');
    const derriere = git('rev-list', '--count', 'HEAD..origin/main');
    if (derriere === null) {
      avertissements.push("origin/main introuvable (dépôt hors ligne ?) — synchro non vérifiée.");
    } else if (Number(derriere) > 0) {
      avertissements.push(
        `La branche « ${branche} » est en retard de ${derriere} commit(s) sur origin/main.\n` +
        '      Rebaser avant de coder, sinon on réinvente ce qui existe déjà.'
      );
    }
  }

  // ── 3. Fichiers parasites à la racine ───────────────────────────────────────
  const parasites = ['.env.local.bak', 'package-lock.json.bak', 'tsconfig.json.bak']
    .filter((f) => existsSync(f));
  if (parasites.length) {
    avertissements.push(`Fichier(s) de sauvegarde à la racine : ${parasites.join(', ')}`);
  }

  // ── Rapport ─────────────────────────────────────────────────────────────────
  for (const a of avertissements) console.log(`⚠ ${a}`);

  if (problemes.length) {
    console.log('');
    for (const p of problemes) console.log(`✗ ${p}`);
    console.log(
      "\nUn module critique absent ne se répare pas en local : il doit être\n" +
      "committé. C'est ce qui a produit les huit fichiers manquants du 10/10."
    );
    process.exit(1);
  }

  console.log(`✓ Espace de travail sain (${CRITIQUES.length} modules critiques présents).`);
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith('check-workspace-sync.mjs')) main();
