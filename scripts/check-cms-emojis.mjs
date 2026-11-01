/**
 * check-cms-emojis — détecte les emojis décoratifs **en base**, dans les tables
 * que le site rend réellement.
 *
 * Pourquoi ce script existe
 * -------------------------
 * `check-design-tics.mjs` lit les fichiers du dépôt. Il ne voit pas la base. Or
 * une valeur peut porter un emoji qui n'existe nulle part dans le code : elle
 * vient de la base, et le rendu la prend telle quelle.
 *
 * Le 22/10, la purge #687 (migration 20261022230000) visait la plage
 * `2600-27BF + 10000-1FAFF`, alors que le détecteur couvre AUSSI `231A-231B`,
 * `23E9-23FF`, `2B1B-2B1C`, `2B50` et `2B55`. Le sablier « ⌛ » de
 * `highlight_2_emoji` est tombé dans ce trou : refusé par la CI sur les
 * fichiers, jamais vu en base. Le trou a été bouché le 25/10 (migration
 * 20261025200000), ce contrôle empêche sa réouverture.
 *
 * La plage Unicode vient du détecteur lui-même (`DECORATIVE_EMOJI_RE`) : une
 * seule source de vérité, pour que les deux garde-fous ne puissent plus diverger.
 *
 * Périmètre : les quatre tables de contenu **rendues** au visiteur, et pour
 * chacune les colonnes réellement affichées :
 *
 *   - `cms_editable_zones`   (zone `is_active`) → `value`
 *   - `cms_blog_posts`       (article `published`) → titres, extraits, contenu, meta
 *   - `cms_sub_destinations` (`is_active`) → `title`, `teaser`, `emoji`
 *   - `cms_guide_items`      (`is_active`) → `title`, `description`, `secret`
 *
 * Une ligne rendue (active/publiée) qui porte un emoji décoratif fait échouer le
 * contrôle. Une ligne non rendue est signalée sans casser le run, comme le veut
 * la sémantique du projet (« désactivé » vaut mieux qu'« inventé »).
 *
 * Les **drapeaux** (U+1F1E6–U+1F1FF, ex. 🇵🇹) sont exclus : ce sont des
 * indicateurs de pays sémantiques, pas des tics décoratifs — même règle que la
 * migration de purge.
 *
 * Usage :
 *   node scripts/check-cms-emojis.mjs
 *
 * Sortie : exit 1 si une ligne rendue porte un emoji ; exit 2 si les identifiants
 * Supabase manquent ou si une lecture échoue (« ignoré » n'est pas « réussi »).
 */

import { readFileSync } from 'node:fs';
import { DECORATIVE_EMOJI_RE } from './check-design-tics.mjs';

/** Plage des indicateurs régionaux (drapeaux) — sémantiques, jamais refusés. */
const DRAPEAU = /^[\u{1F1E6}-\u{1F1FF}]+$/u;

/**
 * Tables rendues et colonnes affichées. `etat` = colonne qui décide du rendu.
 * `label` sert au message d'erreur.
 */
export const TABLES = [
  { table: 'cms_editable_zones', etat: 'is_active', label: 'zone CMS', cle: 'zone_key',
    colonnes: ['value'] },
  { table: 'cms_blog_posts', etat: 'published', label: 'article de blog', cle: 'slug',
    colonnes: ['title', 'excerpt', 'content', 'meta_title', 'meta_description',
               'seo_title', 'seo_description'] },
  { table: 'cms_sub_destinations', etat: 'is_active', label: 'sous-destination', cle: 'slug',
    colonnes: ['title', 'teaser', 'emoji'] },
  { table: 'cms_guide_items', etat: 'is_active', label: 'fiche de guide', cle: 'title',
    colonnes: ['title', 'description', 'secret'] },
];

/**
 * Emojis décoratifs d'une valeur. Un drapeau n'est pas décoratif : il est ignoré.
 * Exporté pour les tests (fonction pure).
 */
export function emojisDeco(valeur) {
  if (typeof valeur !== 'string') return [];
  DECORATIVE_EMOJI_RE.lastIndex = 0;
  return [...valeur.matchAll(DECORATIVE_EMOJI_RE)]
    .map((m) => m[0])
    .filter((e) => !DRAPEAU.test(e));
}

/**
 * Sépare les lignes d'une table en `rendues` (emoji visible) et `inactives`.
 * `rows` est la liste brute renvoyée par PostgREST. Fonction pure.
 */
export function classerLignes(config, rows) {
  const rendues = [];
  const inactives = [];
  for (const r of rows) {
    const emojis = config.colonnes.flatMap((c) => emojisDeco(r[c]));
    if (!emojis.length) continue;
    (r[config.etat] === true ? rendues : inactives).push({ ...r, emojis });
  }
  return { rendues, inactives };
}

function readEnv() {
  let raw = '';
  for (const f of ['.env.local', '.env']) {
    try {
      raw = readFileSync(f, 'utf8');
      break;
    } catch {}
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

async function fetchBatch(url, key, config, from, pageSize, essai = 1) {
  try {
    const headers = { apikey: key, Range: `${from}-${from + pageSize - 1}` };
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
    const select = [...config.colonnes, config.etat, config.cle].join(',');
    const res = await fetch(`${url}/rest/v1/${config.table}?select=${select}`, { headers });
    if (!res.ok) {
      if (res.status >= 500 && essai < 5) {
        await new Promise((r) => setTimeout(r, 1500 * essai));
        return fetchBatch(url, key, config, from, pageSize, essai + 1);
      }
      return { ok: false, status: res.status };
    }
    return { ok: true, batch: await res.json() };
  } catch (e) {
    if (essai < 5) {
      await new Promise((r) => setTimeout(r, 1500 * essai));
      return fetchBatch(url, key, config, from, pageSize, essai + 1);
    }
    return { ok: false, error: e };
  }
}

/** Lit une table entière. PostgREST plafonne à 1000 lignes/réponse, silencieusement. */
async function lireTable(url, key, config) {
  const PAGE_SIZE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const result = await fetchBatch(url, key, config, from, PAGE_SIZE);
    if (!result.ok) {
      const detail = result.status ? `HTTP ${result.status}` : result.error?.message || 'erreur réseau';
      throw new Error(`${config.table} : ${detail}`);
    }
    rows.push(...result.batch);
    if (result.batch.length < PAGE_SIZE) break;
  }
  return rows;
}

async function main() {
  const { url, key } = readEnv();

  const rendues = [];
  const inactives = [];
  let lues = 0;

  for (const config of TABLES) {
    let rows;
    try {
      rows = await lireTable(url, key, config);
    } catch (e) {
      console.error(`✗ Lecture impossible — ${e.message}.`);
      process.exitCode = 2;
      return;
    }
    lues += rows.length;
    const r = classerLignes(config, rows);
    for (const x of r.rendues) rendues.push({ config, x });
    for (const x of r.inactives) inactives.push({ config, x });
  }

  if (inactives.length) {
    console.log(`  ${inactives.length} ligne(s) non rendue(s) portent un emoji (non bloquant) :`);
    for (const { config, x } of inactives) {
      const cle = x[config.cle] ?? '(sans clé)';
      console.log(`      [${config.label}] ${cle}  ${x.emojis.join(' ')}`);
    }
  }

  if (rendues.length) {
    console.error(`\n✗ ${rendues.length} ligne(s) RENDUE(S) porte(nt) un emoji décoratif (visible(s) en ligne) :`);
    for (const { config, x } of rendues) {
      const cle = x[config.cle] ?? '(sans clé)';
      console.error(`    [${config.label}] ${cle}  ${x.emojis.join(' ')}`);
    }
    console.error(
      '\nUn emoji décoratif ne se corrige pas dans le code : la valeur vient de la base.\n' +
      'Écrire une migration versionnée (règle #2) qui normalise la ligne, jamais un UPDATE à la main.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `✓ check-cms-emojis : ${lues} ligne(s) lue(s) sur ${TABLES.length} table(s) rendues, 0 emoji décoratif visible.`
  );
  process.exitCode = 0;
}

if (process.argv[1] && process.argv[1].endsWith('check-cms-emojis.mjs')) {
  main();
}
