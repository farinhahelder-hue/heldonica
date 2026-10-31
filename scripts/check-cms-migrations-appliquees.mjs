/**
 * check-cms-migrations-appliquees — le dépôt et la base sont-ils d'accord ?
 *
 * Pourquoi ce script existe
 * -------------------------
 * Aucun workflow n'exécute `supabase db push` (vérifié le 2026-10-31 : les
 * seules occurrences de « migration » dans `.github/workflows/` sont des
 * commentaires). Fusionner une PR qui porte une migration ne l'applique donc
 * PAS : il faut un geste humain, et rien ne signalait qu'il manquait.
 *
 * D'où des dizaines de tâches du registre en `waiting_validation` avec la
 * mention « MANQUE : appliquer la migration … » — une même cause, répétée, et
 * invisible pour la CI. `check:cms-migrations` (l'existant) ne pouvait pas la
 * voir : il lit les `from('<table>')` du code et les fichiers du dépôt, jamais
 * la base.
 *
 * Ce contrôle comble ce trou : il lit le registre réel des migrations
 * appliquées et le compare aux fichiers du dépôt. Toute migration présente
 * dans la référence git et absente de la base est signalée (exit 1).
 *
 * Choix de la référence — pour ne pas crier sur les PR
 * ----------------------------------------------------
 * La comparaison porte sur une RÉFÉRENCE GIT (`--ref`, défaut `origin/main`),
 * pas sur le répertoire de travail. Une PR qui ajoute une migration ne doit pas
 * faire échouer son propre contrôle : cette migration n'est pas encore sur
 * `main`, donc pas encore censée être appliquée. Seul l'écart entre `main` et
 * la base est un défaut — c'est exactement le blocage à surveiller.
 *
 * `supabase_migrations.schema_migrations` n'étant pas exposée par PostgREST, la
 * lecture passe par la vue `public.migrations_appliquees`
 * (migration `20261031120000`), lisible à la clé secrète seule.
 *
 * Sortie : exit 1 si une migration de la référence n'est pas appliquée ;
 * exit 2 si les identifiants manquent ou si une lecture échoue (« ignoré »
 * n'est pas « réussi »).
 *
 * Usage :
 *   node scripts/check-cms-migrations-appliquees.mjs
 *   node scripts/check-cms-migrations-appliquees.mjs --ref origin/main
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/** Dossier des migrations versionnées. */
export const DOSSIER_MIGRATIONS = 'supabase/migrations';

/**
 * Version (préfixe numérique) d'un nom de fichier de migration.
 * `20261031120000_exposer_migrations.sql` -> `20261031120000`
 * `02_enable_rls.sql`                        -> `02`
 *
 * On accepte toute suite de chiffres, pas seulement 14 : le dépôt porte une
 * migration legacy `02_enable_rls.sql` (appliquée, enregistrée `02` en base).
 * Exiger 8 chiffres la faisait disparaître des DEUX côtés, ce qui faussait le
 * compte sans rien signaler.
 *
 * Fonction pure — testable sans base ni git.
 */
export function versionDeFichier(nom) {
  const m = /^(\d+)_(.+)\.sql$/.exec(nom);
  return m ? m[1] : null;
}

/**
 * Versions présentes dans une liste de noms de fichiers, triées.
 * Les noms illisibles sont écartés : ils ne doivent pas produire de faux écart.
 * Fonction pure — testable sans base ni git.
 */
export function versionsDepuisFichiers(noms) {
  return noms
    .map(versionDeFichier)
    .filter((v) => v !== null)
    .sort();
}

/**
 * Écart entre les migrations attendues et les migrations appliquées.
 *
 * `manquantes` = présentes dans la référence, absentes de la base : c'est le
 * blocage (une migration fusionnée qu'on a oublié d'appliquer).
 * `enPlus` = appliquées mais absentes de la référence : informatif seulement.
 * Une migration appliquée puis retirée du dépôt n'est pas un défaut de mise en
 * ligne — la signaler comme échec ferait crier le contrôle à tort.
 *
 * Fonction pure — testable sans base ni git.
 */
export function comparer(attendues, appliquees) {
  const attendu = new Set(attendues);
  const applique = new Set(appliquees);
  return {
    manquantes: attendues.filter((v) => !applique.has(v)),
    enPlus: appliquees.filter((v) => !attendu.has(v)).sort(),
  };
}

/** Noms de fichiers de migration de la référence git. */
export function fichiersDeReference(ref) {
  const sortie = execFileSync(
    'git',
    ['ls-tree', '--name-only', `${ref}:${DOSSIER_MIGRATIONS}`],
    { encoding: 'utf8' },
  );
  return sortie.split('\n').filter((n) => n.endsWith('.sql'));
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

/** Lit le registre des migrations appliquées, paginé (PostgREST plafonne à 1000). */
async function lireAppliquees(url, key) {
  const PAGE = 1000;
  const versions = [];
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${url}/rest/v1/migrations_appliquees?select=version`, {
      headers: { ...entetes(key), Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) throw new Error(`migrations_appliquees : HTTP ${res.status}`);
    const lot = await res.json();
    versions.push(...lot.map((r) => r.version));
    if (lot.length < PAGE) break;
  }
  return versions;
}

async function main() {
  const args = process.argv.slice(2);
  const iRef = args.indexOf('--ref');
  const ref = iRef >= 0 ? args[iRef + 1] : 'origin/main';

  const { url, key } = readEnv();
  if (!url || !key) {
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.');
    process.exit(2);
  }

  // Référence git : `origin/main` par défaut. Si elle n'existe pas (clone
  // superficiel), on sort en 2 — « ignoré », jamais un faux rouge.
  //
  // Ne PAS retomber sur le répertoire de travail : sur une PR, celui-ci est la
  // branche de la PR elle-même. Sa migration, absente de `main`, serait alors
  // comptée comme non appliquée et la PR échouerait à tort — pour son propre
  // travail, qui n'est pas encore censé être en base. Un contrôle qui crie sur
  // les PR légitimes finit par être ignoré, et n'attrape plus les vrais écarts.
  let noms;
  let source;
  try {
    noms = fichiersDeReference(ref);
    source = ref;
  } catch {
    console.error(`– Référence « ${ref} » introuvable — contrôle ignoré (pas un succès).`);
    console.error(`  Récupérer la référence (\`git fetch origin main\`), ou préciser \`--ref <ref>\`.`);
    process.exit(2);
  }

  const attendues = versionsDepuisFichiers(noms);

  let appliquees;
  try {
    appliquees = await lireAppliquees(url, key);
  } catch (e) {
    console.error(`✗ Lecture des migrations appliquées impossible — ${e.message}.`);
    console.error('  (La vue `public.migrations_appliquees` exige une clé secrète.)');
    process.exit(2);
  }

  const { manquantes, enPlus } = comparer(attendues, appliquees);

  if (enPlus.length) {
    console.log(`– ${enPlus.length} migration(s) appliquée(s) sans fichier dans « ${source} » (informatif) : ${enPlus.join(', ')}`);
  }

  if (manquantes.length === 0) {
    console.log(`✓ Dépôt et base d'accord : ${attendues.length} migration(s) de « ${source} », toutes appliquées.`);
    process.exit(0);
  }

  console.error(`✗ ${manquantes.length} migration(s) présente(s) dans « ${source} » et NON appliquée(s) en base :`);
  for (const v of manquantes) {
    const nom = noms.find((n) => n.startsWith(`${v}_`));
    console.error(`    ${v}  ${nom || ''}`);
  }
  console.error(`
Aucun workflow n'applique les migrations : fusionner une PR ne les met PAS en
base. Appliquer les migrations manquantes, puis relancer ce contrôle.

Geste exact (CLI Supabase, depuis le poste du propriétaire) :
    supabase db push

Si l'application se fait via l'API Management, l'insertion dans le registre est
OBLIGATOIRE et ne se fait pas toute seule (vérifié le 2026-10-31 : une requête
DDL via l'API n'écrit rien dans supabase_migrations.schema_migrations) :
    insert into supabase_migrations.schema_migrations (version, name)
    values ('<version>', '<nom de fichier sans .sql>');
Sans cette ligne, le contrôle croira la migration absente et le restera — c'est
voulu : mieux vaut une alerte qu'un faux « tout est appliqué ».
`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith('check-cms-migrations-appliquees.mjs')) {
  main();
}
