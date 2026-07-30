#!/usr/bin/env node
/**
 * check-cms-drift — détecte la dérive entre le code et le schéma Supabase réel.
 *
 * Scanne tous les `from('<table>')` de app/, components/, lib/, hooks/ puis
 * interroge l'API REST Supabase pour vérifier que chaque table existe.
 *
 * Raison d'être : le dossier supabase/migrations/ n'est pas l'état de la base
 * (aucun CI ne l'applique). 5 routes admin ont pointé pendant des mois vers des
 * tables inexistantes sans que rien ne le signale. Voir
 * docs/CMS_FOUNDATION_PHASE_0_INVENTAIRE.md
 *
 * Usage :
 *   node scripts/check-cms-drift.mjs
 *
 * Sortie : exit 1 uniquement si une dérive NON connue apparaît. Les dérives
 * déjà inventoriées (KNOWN_DRIFT) sont rapportées mais ne cassent pas le run,
 * pour que ce script soit utilisable en CI dès aujourd'hui.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_DIRS = ['app', 'components', 'lib', 'hooks'];
const EXTS = new Set(['.ts', '.tsx']);

/**
 * Tables connues comme absentes de la prod au 2026-07-30.
 * Retirer une entrée d'ici dès que sa migration est appliquée — le script
 * signalera alors toute régression.
 */
const KNOWN_DRIFT = new Set([
  // Back-office
  'cms_pillar_pages',        // migration 20260730_cms_pillar_pages_idempotent.sql prête, non appliquée
  'cms_pricing_plans',       // /admin/pricing cassé — décision produit en attente
  'cms_redirects',           // /admin/redirects cassé
  'cms_checklist_templates', // /api/cms/checklist-templates cassé
  // Pages publiques — dégradent proprement, pas d'incident, mais le contenu
  // affiché vient d'un fallback hardcodé et non du CMS
  'cms_guide_items',         // /guides/top-10-pepites-madere -> PEPITES_FALLBACK
  'cms_testimonials',        // /temoignages -> liste vide. C'est ce qui fait tenir
                             // la décision A2 « pas de faux témoignages » : créer
                             // la table avec un seed réintroduirait de faux avis.
  // Automatisations
  'instagram_scheduled_posts', // /api/instagram/cron + /scheduled : planification Instagram HS
  'jules_sessions',            // /api/jules
  'jules_memory',              // /api/jules
  'media',                     // /api/cms/video-assembly — nom probablement faux (cms_media ?)
]);

function readEnv() {
  let raw = '';
  for (const f of ['.env.local', '.env']) {
    try { raw = readFileSync(f, 'utf8'); break; } catch {}
  }
  const get = (k) => {
    if (process.env[k]) return process.env[k];
    const m = raw.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };
  const url = get('NEXT_PUBLIC_SUPABASE_URL');
  const key = get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL et une clé Supabase sont requis.');
    process.exit(2);
  }
  return { url, key };
}

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

function collectTables() {
  const found = new Map(); // table -> Set<file>
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]\s*\)/g)) {
        const t = m[1];
        if (!found.has(t)) found.set(t, new Set());
        found.get(t).add(file);
      }
    }
  }
  return found;
}

async function tableExists(url, key, table) {
  const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
  });
  if (r.status === 200 || r.status === 206) {
    const cr = r.headers.get('content-range');
    return { exists: true, rows: cr ? cr.split('/')[1] : '?' };
  }
  if (r.status === 404) return { exists: false };
  // 401/403 = table présente mais RLS bloque : ce n'est pas une dérive de schéma.
  return { exists: true, rows: `?(HTTP ${r.status})` };
}

const { url, key } = readEnv();
const tables = collectTables();
console.log(`Tables référencées dans le code : ${tables.size}\n`);

const missing = [];
const ok = [];

for (const table of [...tables.keys()].sort()) {
  const res = await tableExists(url, key, table);
  if (res.exists) ok.push(`${table} (${res.rows} lignes)`);
  else missing.push(table);
}

console.log(`✓ ${ok.length} table(s) présente(s) :`);
for (const t of ok) console.log(`    ${t}`);

if (missing.length === 0) {
  console.log('\n✓ Aucune dérive. Toutes les tables référencées existent.');
  process.exit(0);
}

const knownMissing = missing.filter((t) => KNOWN_DRIFT.has(t));
const newMissing = missing.filter((t) => !KNOWN_DRIFT.has(t));

if (knownMissing.length) {
  console.log(`\n⚠ ${knownMissing.length} dérive(s) connue(s) et inventoriée(s) :`);
  for (const t of knownMissing) {
    console.log(`    ${t}`);
    for (const f of tables.get(t)) console.log(`        ${f}`);
  }
}

if (newMissing.length) {
  console.log(`\n✗ ${newMissing.length} DÉRIVE NOUVELLE — table référencée mais absente de la base :`);
  for (const t of newMissing) {
    console.log(`    ${t}`);
    for (const f of tables.get(t)) console.log(`        ${f}`);
  }
  console.log('\nSoit la migration n\'est pas appliquée, soit le nom de table est faux.');
  process.exit(1);
}

console.log('\n✓ Aucune dérive nouvelle.');
process.exit(0);
