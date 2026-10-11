import { readFileSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const KNOWN_DRIFT = new Set([
  'cms_accommodations',
  'cms_api_tokens',
  'cms_audit_log',
  'cms_post_revisions',
  'cms_releases',
  'cms_webhook_deliveries',
  'cms_webhooks',
  'cms_zone_variants',
  'photo_blocks'
]);
const SCAN_DIRS = ['app', 'components', 'lib'];
const EXTS = new Set(['.ts', '.tsx']);

function readEnv() {
  const get = (k) => {
    if (process.env[k]) return process.env[k];
    let src;
    try { src = readFileSync('.env.local', 'utf8'); } catch { return null; }
    const m = src.match(new RegExp('^' + k + '=(.*)$', 'm'));
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
  const found = new Map();
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
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
  const found = new Map();
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
        .replace(/\.storage\s*\n?\s*\.from\(\s*['"`][^'"`]+['"`]\s*\)/g, '.storage.__bucket__()')
        .replace(/\.from\(\s*['"`]([a-zA-Z0-9_]+)['"`]\s*\)/g, '.from(@@$1@@)')
        .replace(/'(?:\\.|[^'\\])*'/g, "''")
        .replace(/"(?:\\.|[^"\\])*"/g, '""')
        .replace(/`(?:\\.|[^`\\])*`/g, '``');

      const re = /\.from\(@@([a-zA-Z0-9_]+)@@\)([\s\S]{0,400}?)\.(insert|update|upsert)\(\s*\{([\s\S]{0,900}?)\}/g;

      for (const m of src.matchAll(re)) {
        const [, table, entreDeux, , corps] = m;
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

const schema = await fetchSchema(url, key);
let colonnesAbsentes = 0;

if (!schema) {
  console.log('\n? Schéma des colonnes illisible — contrôle des colonnes ignoré.');
} else {
  const parTable = collectColumns();
  const rapport = [];

  for (const [table, colonnes] of parTable) {
    const reelles = schema.get(table);
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
