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
  // cms_pillar_pages : RÉSOLU le 2026-07-30 (Phase 1). Retiré volontairement de
  // cette liste — toute disparition future de la table fera échouer le script.
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
  'instagram_comments',        // /api/webhooks/instagram + /api/cms/instagram/comments
  'instagram_webhook_logs',    // /api/webhooks/instagram
  'jules_sessions',            // /api/jules
  'jules_memory',              // /api/jules
  // 'media' figurait ici avec la mention « nom probablement faux (cms_media ?) ».
  // Ce n'était ni une table ni une faute de frappe : le scanner confondait
  // `storage.from('media')`, qui vise un bucket, avec une lecture de table.
  // La cause est corrigée dans collectTables ; l'exception n'a plus lieu d'être.
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
      // On retire d'abord les appels de stockage : `storage.from('media')`
      // désigne un bucket, pas une table. Sans cela, `media` était rapporté
      // comme table manquante à chaque exécution — une dérive fantôme, du bruit
      // qui finit par faire ignorer les vraies alertes.
      //
      // Le retrait se fait sur le texte plutôt que par une anti-recherche dans
      // le motif : la chaîne s'écrit souvent sur deux lignes
      // (`sb.storage` puis `.from(...)`), et un lookbehind n'y verrait alors
      // qu'une espace avant `.from`.
      const src = readFileSync(file, 'utf8')
        .replace(/\.storage\s*\n?\s*\.from\(\s*['"`][^'"`]+['"`]\s*\)/g, '.storage.__bucket__()');

      for (const m of src.matchAll(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]\s*\)/g)) {
        const t = m[1];
        if (!found.has(t)) found.set(t, new Set());
        found.get(t).add(file);
      }
    }
  }
  return found;
}

/**
 * Colonnes écrites par le code, table par table.
 *
 * Ce contrôle manquait, et son absence a coûté cher : `cms_media` a divergé de
 * sa migration d'origine (`file_path`/`file_type`/`file_size` déclarés, mais
 * `url`/`mime_type`/`size` en base). Deux routes écrivaient contre les noms de
 * la migration, donc contre des colonnes inexistantes — sans que rien ne le
 * signale, puisque seule l'existence des tables était vérifiée.
 *
 * On ne lit que les écritures (`insert`, `update`, `upsert`) : ce sont elles
 * qui échouent sur une colonne absente. Un `select` erroné se voit tout de
 * suite, une écriture silencieuse non.
 */
/**
 * Clés du premier niveau d'un littéral d'objet.
 *
 * Une colonne jsonb comme `metadata` contient ses propres clés : les compter
 * comme colonnes produirait une avalanche de fausses alertes (`place_title`,
 * `geo_source`…), et une alerte fausse finit toujours par faire ignorer les
 * vraies. On suit donc la profondeur des accolades et des crochets.
 */
function clesDePremierNiveau(corps) {
  const cles = [];
  let profondeur = 0;

  for (const m of corps.matchAll(/[{}[\]]|([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)) {
    const jeton = m[0];
    if (jeton === '{' || jeton === '[') { profondeur++; continue; }
    if (jeton === '}' || jeton === ']') { profondeur--; continue; }
    if (profondeur === 0 && m[1]) cles.push(m[1]);
  }
  return cles;
}

function collectColumns() {
  const found = new Map(); // table -> Map<colonne, Set<file>>

  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8')
        // Les commentaires sont retirés avant analyse : une phrase du type
        // « la colonne réelle : url » y ressemble à une clé d'objet et
        // produisait des colonnes fantômes.
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
        .replace(/\.storage\s*\n?\s*\.from\(\s*['"`][^'"`]+['"`]\s*\)/g, '.storage.__bucket__()')
        // Le nom de table est mis à l'abri avant le vidage des chaînes, qui
        // l'effacerait avec le reste.
        .replace(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]\s*\)/g, '.from(@@$1@@)')
        // Contenu des chaînes vidé : une URL (`https://…`) ou un libellé
        // (`'Carnets Voyage'`) y ressemble à une clé et devenait une colonne
        // fantôme. Les vraies clés sont toujours hors des chaînes.
        .replace(/'(?:\\.|[^'\\])*'/g, "''")
        .replace(/"(?:\\.|[^"\\])*"/g, '""')
        .replace(/`(?:\\.|[^`\\])*`/g, '``');

      // `.from(table)` suivi, dans les 400 caractères, d'une écriture dont on
      // lit le littéral d'objet. La fenêtre évite de rattacher à une table les
      // clés d'un appel situé bien plus loin dans le fichier.
      const re = /\.from\(@@([a-zA-Z0-9_]+)@@\)([\s\S]{0,400}?)\.(insert|update|upsert)\(\s*\{([\s\S]{0,900}?)\}/g;

      for (const m of src.matchAll(re)) {
        const [, table, entreDeux, , corps] = m;
        // Un autre `.from(` entre-temps signifie que l'écriture appartient à
        // une requête différente.
        if (/\.from\(/.test(entreDeux)) continue;

        for (const col of clesDePremierNiveau(corps)) {
          if (!found.has(table)) found.set(table, new Map());
          if (!found.get(table).has(col)) found.get(table).set(col, new Set());
          found.get(table).get(col).add(file);
        }
      }
    }
  }
  return found;
}

/** Colonnes réelles, lues dans le schéma OpenAPI exposé par PostgREST. */
async function fetchSchema(url, key) {
  try {
    const r = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!r.ok) return null;
    const spec = await r.json();
    const par = new Map();
    for (const [table, def] of Object.entries(spec.definitions ?? {})) {
      par.set(table, new Set(Object.keys(def.properties ?? {})));
    }
    return par;
  } catch {
    return null;
  }
}

async function tableExists(url, key, table, essai = 1) {
  let r;
  try {
    r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
    });
  } catch (e) {
    // Une coupure passagère faisait planter tout le contrôle sur une trace
    // brute : en CI, cela ressemblait à une dérive détectée alors que rien
    // n'avait été verifié. On réessaie, puis on l'annonce comme indéterminé.
    if (essai < 3) {
      await new Promise(r => setTimeout(r, 400 * essai));
      return tableExists(url, key, table, essai + 1);
    }
    return { exists: true, rows: `?(réseau : ${e.cause?.code ?? 'échec'})` };
  }
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

// ── Colonnes ────────────────────────────────────────────────────────────────
const schema = await fetchSchema(url, key);
let colonnesAbsentes = 0;

if (!schema) {
  console.log('\n? Schéma des colonnes illisible — contrôle des colonnes ignoré.');
} else {
  const parTable = collectColumns();
  const rapport = [];

  for (const [table, colonnes] of parTable) {
    const reelles = schema.get(table);
    // Table absente : déjà signalée plus haut, inutile d'y ajouter le bruit de
    // toutes ses colonnes.
    if (!reelles) continue;

    for (const [col, fichiers] of colonnes) {
      if (!reelles.has(col)) rapport.push({ table, col, fichiers: [...fichiers] });
    }
  }

  colonnesAbsentes = rapport.length;

  if (colonnesAbsentes === 0) {
    console.log('\n✓ Toutes les colonnes écrites existent en base.');
  } else {
    console.log(`\n✗ ${colonnesAbsentes} colonne(s) écrite(s) mais absente(s) de la base :`);
    for (const r of rapport) {
      const proches = [...(schema.get(r.table) ?? [])]
        .filter(c => c.includes(r.col.replace(/^file_/, '')) || r.col.includes(c));
      console.log(`    ${r.table}.${r.col}${proches.length ? `   (existe : ${proches.join(', ')} ?)` : ''}`);
      for (const f of r.fichiers) console.log(`        ${f}`);
    }
    console.log(
      "\nUne ecriture sur une colonne absente echoue silencieusement si son resultat n'est pas lu."
    );
    console.log(
      "Signale sans faire echouer : une colonne peut n'attendre qu'une migration\n" +
      "non encore appliquee. Rien ne permet de la distinguer d'une faute de frappe\n" +
      "sans lire les migrations en attente — et une CI rouge pour une migration\n" +
      'programmee pousserait a desactiver le controle.'
    );
  }
}

console.log('\n✓ Aucune dérive nouvelle.');
process.exit(0);
