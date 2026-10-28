/**
 * check-cms-migrations — toute table Supabase référencée par le code doit avoir
 * une migration versionnée dans supabase/migrations/.
 *
 * Pourquoi ce contrôle existe, à côté de check:cms-drift
 * ------------------------------------------------------
 * check:cms-drift interroge la base : il lui faut NEXT_PUBLIC_SUPABASE_URL et
 * une clé. Sans ces secrets, le job CI est *sauté* et affiché vert — un faux
 * vert, exactement le genre de silence qui a laissé passer le commit a48552a
 * (2026-10-10) : 92 fichiers, 28 suites de tests, et 9 tables jamais migrées.
 *
 * Celui-ci ne lit que le dépôt. Il tourne en une seconde, sans secret, donc il
 * ne peut pas être sauté. Il attrape le cas « le code référence une table
 * qu'aucune migration ne crée » au moment du commit, pas des mois après.
 *
 * Ce qu'il ne fait pas : il ne dit rien de l'état réel de la base. Une table
 * migrée mais jamais appliquée passe ici et échoue là-bas. Les deux contrôles
 * sont complémentaires, pas redondants :
 *   - check:cms-migrations (ici)  : la migration existe-t-elle dans le dépôt ?
 *   - check:cms-drift            : la table existe-t-elle en production ?
 *
 * Usage : node scripts/check-cms-migrations.mjs
 * Sortie : exit 1 si une table référencée n'a ni migration ni exception.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_DIRS = ['app', 'components', 'lib', 'hooks'];
const MIGRATIONS_DIR = 'supabase/migrations';
const EXTS = new Set(['.ts', '.tsx']);

/**
 * Tables présentes en production mais sans migration versionnée dans le dépôt.
 *
 * VIDE depuis le 2026-10-28 : les 5 tables qui figuraient ici ont reçu leur
 * migration de rattachement (20261028120000_rattachement_tables_legacy.sql),
 * écrite depuis le schéma réel relevé en production (colonnes, contraintes,
 * index, politiques RLS). La 6e entrée, `destinations_public`, n'était pas une
 * table mais une VUE — déjà migrée (4 fichiers) ; c'était un faux positif, la
 * cause est corrigée dans collectMigratedTables (voir plus bas).
 *
 * La liste reste en place, vide, comme garde-fou : toute NOUVELLE table
 * référencée par le code sans migration fera échouer le contrôle. Une table
 * n'a rien à y faire si elle peut recevoir sa migration — cette liste ne sert
 * qu'à débloquer un cas qu'on ne peut pas encore migrer.
 */
const LEGACY_UNMIGRATED = new Set([]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.has(extname(p))) out.push(p);
  }
  return out;
}

/**
 * Tables visées par un `from('<table>')`, tous dossiers scannés confondus.
 *
 * `storage.from('media')` vise un bucket, pas une table : on l'écarte avant
 * l'analyse, comme dans check-cms-drift (le même bruit, la même cause).
 */
export function collectReferencedTables(dirs = SCAN_DIRS, walker = walk) {
  const found = new Map(); // table -> Set<file>
  for (const dir of dirs) {
    for (const file of walker(dir)) {
      const src = readFileSync(file, 'utf8')
        .replace(/\.storage\s*\n?\s*\.from\(\s*['"`][^'"`]+['"`]\s*\)/g, '.storage.__bucket__()');
      for (const m of src.matchAll(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]\s*\)/g)) {
        if (!found.has(m[1])) found.set(m[1], new Set());
        found.get(m[1]).add(file);
      }
    }
  }
  return found;
}

/**
 * Tables créées par au moins une migration, lues par expression régulière sur le
 * SQL. On ne parse pas le SQL en entier : on cherche les deux seules formes qui
 * comptent, `CREATE TABLE [IF NOT EXISTS] [public.]nom` et
 * `CREATE [OR REPLACE] VIEW [public.]nom`.
 *
 * Les vues sont comptées comme des « objets lisibles par `.from()` » : le code
 * lit `destinations_public` exactement comme une table, et une vue a sa
 * migration. Sans cette seconde expression, toute vue référencée par le code
 * était signalée à tort comme table non migrée — c'est ce qui a maintenu
 * `destinations_public` dans LEGACY_UNMIGRATED des mois durant.
 */
export function collectMigratedTables(dir = MIGRATIONS_DIR) {
  const tables = new Set();
  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith('.sql')); } catch { return tables; }
  const re = /CREATE\s+(?:TABLE|(?:OR\s+REPLACE\s+)?VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["`]?([a-zA-Z_][a-zA-Z0-9_]*)["`]?/gi;
  for (const f of files) {
    const sql = readFileSync(join(dir, f), 'utf8');
    for (const m of sql.matchAll(re)) tables.add(m[1].toLowerCase());
  }
  return tables;
}

/** Tables référencées sans migration et hors exceptions. */
export function findUnmigrated(referenced, migrated, legacy = LEGACY_UNMIGRATED) {
  const out = [];
  for (const table of [...referenced.keys()].sort()) {
    if (migrated.has(table.toLowerCase())) continue;
    if (legacy.has(table)) continue;
    out.push(table);
  }
  return out;
}

function main() {
  const referenced = collectReferencedTables();
  const migrated = collectMigratedTables();
  const unmigrated = findUnmigrated(referenced, migrated);

  console.log(`Tables référencées dans le code : ${referenced.size}`);
  console.log(`Tables créées par une migration : ${migrated.size}`);
  console.log(`Tables hors migration et hors exceptions : ${unmigrated.length}\n`);

  if (unmigrated.length === 0) {
    console.log('✓ Toute table référencée par le code a une migration versionnée.');
    process.exit(0);
  }

  console.log(`✗ ${unmigrated.length} table(s) référencée(s) par le code sans migration versionnée :`);
  for (const t of unmigrated) {
    console.log(`    ${t}`);
    for (const f of referenced.get(t)) console.log(`        ${f}`);
  }
  console.log(
    "\nUne table sans migration n'a aucun état reproductible : elle existe (ou non)" +
    "\nselon ce qui a été exécuté à la main. C'est l'origine des 56 migrations" +
    "\norphelines rattrapées le 19/08. Écrire la migration, ou inscrire la table" +
    "\ndans LEGACY_UNMIGRATED avec la raison."
  );
  process.exit(1);
}

// Exécuté seulement en ligne de commande : les tests importent les fonctions.
if (process.argv[1] && process.argv[1].endsWith('check-cms-migrations.mjs')) main();
