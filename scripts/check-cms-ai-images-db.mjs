/**
 * check-cms-ai-images-db — refuse les URL de visuels générés **en base**.
 *
 * Pourquoi ce script existe
 * -------------------------
 * `check-cms-ai-images.mjs` lit `public/` et le code du dépôt. Il ne voit pas
 * la base. Or l'URL d'un visuel généré peut vivre dans une valeur CMS — et le
 * rendu la prend telle quelle.
 *
 * Le 30/10/2026, deux purges (migrations 20261030180000 et 20261030200000) ont
 * été annoncées complètes en ne visant que les COLONNES D'IMAGE
 * (`featured_image`, `og_image`, `hero_unsplash_url`). Un balayage exhaustif de
 * toutes les colonnes texte et json de toutes les tables `public` a montré le
 * 31/10 que des URL subsistaient dans des colonnes de CONTENU :
 *
 *   · `cms_blog_posts.content`     — images inline d'un article
 *   · `cms_pillar_pages.hero`      — image d'en-tête d'une page pilier
 *   · `article_revisions.content`  — historique **restaurable** d'un article publié
 *
 * Toutes étaient inactives (brouillon / `is_active=false`), donc non servies —
 * mais la révision était restaurable en un clic. C'est le même trou que celui
 * reproché à #790 : un contrôle qui ne regarde qu'une famille de colonnes et
 * déclare le reste propre.
 *
 * Ce script est volontairement **exhaustif** : il ne devine pas quelles
 * colonnes comptent, il lit le schéma exposé par PostgREST (racine OpenAPI,
 * qui liste chaque objet et ses colonnes) et balaie toute colonne textuelle ou
 * json de toute table. Une colonne ajoutée demain est couverte sans toucher au
 * script.
 *
 * Clé requise : une clé **secrète**. La racine OpenAPI la refuse aux clés
 * publiables (« Secret API key required »), et la RLS masque les brouillons à
 * une clé publiable — or c'est précisément là que se cachent les références
 * non encore publiées. Sans clé secrète, le contrôle est *ignoré* (exit 2),
 * jamais déclaré réussi.
 *
 * Les objets générés connus portent un manifeste C2PA signé par le générateur
 * (`c2pa.created` « Created by Google Generative AI », `digitalSourceType` =
 * `trainedAlgorithmicMedia`) — relevé le 30/10/2026 en téléchargeant les
 * fichiers. Aucune photo de terrain correspondante n'existe.
 *
 * Sortie : exit 1 si une URL générée est présente ; exit 2 si les identifiants
 * manquent ou si une lecture échoue (« ignoré » n'est pas « réussi »).
 *
 * Usage :
 *   node scripts/check-cms-ai-images-db.mjs
 */

import { readFileSync } from 'node:fs';

/**
 * Objets du stockage dont le manifeste C2PA a été relevé comme généré.
 * Le motif porte sur le chemin de l'objet, pas sur l'URL complète : la base
 * peut avoir changé de domaine, le nom de l'objet, non.
 */
export const OBJETS_GENERES = [
  'destinations/madere/ponta_do_sol.jpg',
  'destinations/madere/achadas_da_cruz.jpg',
  'destinations/madere/porto_moniz.jpg',
  'destinations/madere/pico_do_arieiro.jpg',
  'destinations/madere/fanal_foret.jpg',
  'destinations/montenegro/moraca_millennium.jpg',
  'destinations/montenegro/sahat_kula.jpg',
  'destinations/montenegro/sipcanik_winery.jpg',
  'destinations/montenegro/stara_varos.jpg',
];

/** Types de colonnes pouvant contenir une URL. */
const TYPES_TEXTE = new Set(['text', 'character varying', 'jsonb', 'json']);

/**
 * Colonnes à balayer, à partir du schéma exposé par PostgREST.
 * Fonction pure — testable sans base.
 * @param {object} openapi racine OpenAPI de PostgREST
 * @returns {{table: string, colonne: string}[]}
 */
export function ciblesDepuisSchema(openapi) {
  const defs = openapi?.definitions || openapi?.components?.schemas || {};
  const cibles = [];
  for (const [table, def] of Object.entries(defs)) {
    const colonnes = def?.properties || {};
    // PostgREST marque les TABLES par une clé primaire (`required`) ; les vues
    // n'en ont pas. On scanne les deux, mais une vue illisible (ex. v_pipeline_b2b
    // répond 500) ne doit pas masquer le contrôle : ses données viennent d'une
    // table, elle-même scannée. Une table illisible, elle, est fatale.
    const estVue = !def?.required;
    const cle = 'id' in colonnes ? 'id' : ('key' in colonnes ? 'key' : null);
    for (const [colonne, prop] of Object.entries(colonnes)) {
      const type = prop?.format || prop?.type;
      const estJson = prop?.type === 'object' || prop?.type === 'array';
      if (estJson || TYPES_TEXTE.has(type)) cibles.push({ table, colonne, cle, estVue });
    }
  }
  return cibles.sort((a, b) =>
    a.table === b.table ? a.colonne.localeCompare(b.colonne) : a.table.localeCompare(b.table),
  );
}

/**
 * Repère les objets générés cités dans une valeur.
 * Fonction pure — testable sans base.
 */
export function objetsDansValeur(valeur, objets = OBJETS_GENERES) {
  if (valeur == null) return [];
  const texte = String(valeur);
  return objets.filter((o) => texte.includes(o));
}

/**
 * Repère les lignes fautives d'un lot.
 * Fonction pure — testable sans base.
 */
export function lignesFautives(cible, lignes, objets = OBJETS_GENERES) {
  const fautives = [];
  for (const ligne of lignes) {
    const trouvees = objetsDansValeur(ligne?.[cible.colonne], objets);
    if (trouvees.length) {
      const id = cible.cle ? ligne?.[cible.cle] : null;
      fautives.push({ ...cible, id, objets: trouvees });
    }
  }
  return fautives;
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
  const url = get('NEXT_PUBLIC_SUPABASE_URL') || get('SUPABASE_URL');
  const key = get('SUPABASE_SERVICE_ROLE_KEY') || get('SUPABASE_SERVICE_KEY') || get('SUPABASE_SECRET_KEY');
  return { url, key };
}

function entetes(key) {
  const h = { apikey: key, Accept: 'application/json' };
  // Le format `sb_secret_...` n'est pas un JWT : jamais dans Authorization.
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
}

async function racineOpenApi(url, key) {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: { ...entetes(key), Accept: 'application/openapi+json' },
  });
  if (!res.ok) throw new Error(`schéma PostgREST : HTTP ${res.status}`);
  return res.json();
}

/** Lit une colonne, paginée (PostgREST plafonne à 1000 lignes, silencieusement). */
async function lire(url, key, cible) {
  const PAGE = 1000;
  const select = cible.cle ? `${cible.cle},${cible.colonne}` : cible.colonne;
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(
      `${url}/rest/v1/${cible.table}?select=${select}`,
      { headers: { ...entetes(key), Range: `${from}-${from + PAGE - 1}` } },
    );
    if (!res.ok) throw new Error(`${cible.table}.${cible.colonne} : HTTP ${res.status}`);
    const lot = await res.json();
    rows.push(...lot);
    if (lot.length < PAGE) break;
  }
  return rows;
}

async function main() {
  const { url, key } = readEnv();
  if (!url || !key) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.');
    process.exit(2);
  }

  let schema;
  try {
    schema = await racineOpenApi(url, key);
  } catch (e) {
    console.error(`✗ Lecture du schéma impossible — ${e.message}.`);
    console.error('  (La racine OpenAPI exige une clé secrète.)');
    process.exit(2);
  }

  const cibles = ciblesDepuisSchema(schema);
  const fautives = [];
  const vuesIgnorees = [];
  let lues = 0;
  for (const cible of cibles) {
    let rows;
    try {
      rows = await lire(url, key, cible);
    } catch (e) {
      if (cible.estVue) {
        vuesIgnorees.push(`${cible.table}.${cible.colonne}`);
        continue;
      }
      console.error(`✗ Lecture impossible — ${e.message}.`);
      process.exit(2);
    }
    lues += rows.length;
    fautives.push(...lignesFautives(cible, rows));
  }

  if (vuesIgnorees.length) {
    console.log(`– ${vuesIgnorees.length} colonne(s) de vue non lisible(s), ignorée(s) : ${vuesIgnorees.join(', ')}`);
  }

  if (fautives.length === 0) {
    console.log(`✓ Aucune URL de visuel généré en base (${cibles.length} colonnes, ${lues} valeurs balayées).`);
    process.exit(0);
  }

  console.error(`✗ ${fautives.length} valeur(s) citant un visuel généré par IA :`);
  for (const f of fautives) {
    console.error(`    ${f.table}.${f.colonne} (id ${f.id}) — ${f.objets.join(', ')}`);
  }
  console.error(`
Ces objets portent un manifeste C2PA de générateur et ne peuvent pas illustrer un
voyage vécu (AGENTS.md, règle n°1). Remplacer l'URL par une photo de terrain, ou
retirer l'image. Ne pas supprimer le texte : la règle du projet est de dépublier,
pas d'effacer.
`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith('check-cms-ai-images-db.mjs')) {
  main();
}
