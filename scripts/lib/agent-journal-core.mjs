/**
 * agent-journal — le noyau : rediger, puis ecrire une action.
 *
 * Partage par le CLI (`scripts/agent-journal.mjs`), le hook `post-commit` et
 * le serveur MCP (`mcp/agent-tasks/ledger.mjs`). Trois points d'emission, un
 * seul format, une seule fonction de redaction : c'est la seule facon que le
 * journal reste lisible dans six mois.
 *
 * Regles :
 * - aucun geste n'echoue a cause du journal (best-effort, jamais de throw) ;
 * - aucune valeur de secret n'est ecrite (`redact`) : le journal est un
 *   fichier en base, pas un ecran — les incidents `sb_secret_…` / `ghu_…` du
 *   26/10 ont montre ce que coute un secret dans un journal de session ;
 * - une variable absente se signale par sa presence, jamais par sa valeur.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Cles dont la valeur ne sort jamais, meme tronquee. */
const CLES_SENSIBLES =
  /(secret|token|password|passwd|apikey|api_key|authorization|cookie|bearer|private_key|service_role)/i;

/** Motifs de secrets reconnaissables dans une simple chaine. */
const MOTIFS_SECRETS = [
  /sb_secret_[A-Za-z0-9_-]{6,}/g,
  /sb_publishable_[A-Za-z0-9_-]{6,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
];

const TAILLE_MAX_CHAINE = 2000;

function masquerChaine(valeur) {
  let sortie = valeur.slice(0, TAILLE_MAX_CHAINE);
  for (const motif of MOTIFS_SECRETS) {
    sortie = sortie.replace(motif, (trouve) => `[masque: ${trouve.length} car.]`);
  }
  return sortie;
}

/**
 * Rend une valeur sure a journaliser. Une cle sensible est remplacee par sa
 * longueur, jamais par sa valeur ; une chaine est tronquee et ses motifs de
 * secret masques ; un objet est parcouru.
 */
export function redact(valeur, cle = '') {
  if (typeof valeur === 'string') {
    if (cle && CLES_SENSIBLES.test(cle)) return `[masque: ${valeur.length} car.]`;
    return masquerChaine(valeur);
  }
  if (Array.isArray(valeur)) {
    return valeur.slice(0, 50).map((element) => redact(element, cle));
  }
  if (valeur && typeof valeur === 'object') {
    const sortie = {};
    for (const [nom, contenu] of Object.entries(valeur)) {
      if (CLES_SENSIBLES.test(nom)) {
        sortie[nom] = `[masque: ${String(contenu ?? '').length} car.]`;
        continue;
      }
      sortie[nom] = redact(contenu, nom);
    }
    return sortie;
  }
  return valeur;
}

/** Charge .env.local / .env sans jamais ecraser une variable posee par le client. */
export function chargerEnv() {
  for (const nom of ['.env.local', '.env']) {
    const chemin = resolve(RACINE, nom);
    if (!existsSync(chemin)) continue;
    for (const ligne of readFileSync(chemin, 'utf8').split(/\r?\n/)) {
      const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m || process.env[m[1]] !== undefined) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    break;
  }
}

function configuration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  return url && cle ? { url, cle } : null;
}

/** Les colonnes lues par le CLI et le panneau, dans l'ordre d'affichage. */
const COLONNES = [
  'id',
  'task_id',
  'agent',
  'kind',
  'verb',
  'target',
  'outcome',
  'detail',
  'commit_sha',
  'branch',
  'duration_ms',
  'created_at',
].join(',');

function entetes(cle) {
  const h = { apikey: cle, 'Content-Type': 'application/json' };
  // Le nouveau format (sb_secret_…) n'est pas un JWT : apikey seulement.
  if (cle.startsWith('eyJ')) h.Authorization = `Bearer ${cle}`;
  return h;
}

/**
 * Ecrit une action. Rend true si la ligne est en base, false sinon — sans
 * jamais lever : un journal indisponible ne doit pas interrompre le travail.
 */
export async function journaliser(action = {}) {
  if (process.env.AGENT_JOURNAL === 'off') return false;
  const config = configuration();
  if (!config) return false;

  const corps = {
    task_id: action.task_id || null,
    agent: (action.agent || process.env.AGENT_NAME || 'inconnu').toLowerCase(),
    session_id: action.session_id || null,
    kind: action.kind || 'tool',
    verb: action.verb || 'action',
    target: action.target || null,
    outcome: action.outcome || 'ok',
    detail: redact(action.detail || {}),
    commit_sha: action.commit_sha || null,
    branch: action.branch || process.env.AGENT_BRANCH || null,
    duration_ms: Number.isFinite(action.duration_ms) ? Math.round(action.duration_ms) : null,
  };

  try {
    const reponse = await fetch(`${config.url}/rest/v1/agent_actions`, {
      method: 'POST',
      headers: { ...entetes(config.cle), Prefer: 'return=minimal' },
      body: JSON.stringify(corps),
    });
    if (!reponse.ok) {
      const texte = await reponse.text();
      const message = /column .* does not exist/i.test(texte)
        ? 'table agent_actions absente — appliquer supabase/migrations/20261029160000_agent_actions.sql'
        : `PostgREST ${reponse.status}`;
      process.stderr.write(`agent-journal : ${message}\n`);
      return false;
    }
    return true;
  } catch (e) {
    process.stderr.write(`agent-journal : ecriture impossible (${e?.message || 'reseau'})\n`);
    return false;
  }
}

/** Lit les dernieres actions, pour le CLI et les tests. */
export async function lireActions(limite = 20) {
  const config = configuration();
  if (!config) throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');

  const reponse = await fetch(
    `${config.url}/rest/v1/agent_actions?select=${COLONNES}&order=created_at.desc&limit=${limite}`,
    { headers: entetes(config.cle) }
  );
  const texte = await reponse.text();
  if (!reponse.ok) throw new Error(`PostgREST ${reponse.status} : ${texte.slice(0, 200)}`);
  return texte ? JSON.parse(texte) : [];
}

/** Auto-controle de la redaction, utilise par `--selftest` et par la CI. */
export function selftest() {
  const cas = [
    ['sb_secret_abcdefgh12345678', 'motif sb_secret'],
    ['ghp_abcdefghijklmnopqrstuvwxyz0123456789', 'motif GitHub'],
    ['eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop', 'JWT'],
  ];
  const echecs = [];

  for (const [entree, nom] of cas) {
    if (!String(redact(entree)).includes('[masque:')) echecs.push(`chaine non masquee : ${nom}`);
    const objet = redact({ SUPABASE_SERVICE_ROLE_KEY: entree });
    if (!String(objet.SUPABASE_SERVICE_ROLE_KEY).startsWith('[masque:')) {
      echecs.push(`cle sensible non masquee : ${nom}`);
    }
  }

  if (JSON.stringify(redact({ task: 'ok', nested: { api_key: 'abcdef' } })).includes('abcdef')) {
    echecs.push('cle imbriquee non masquee');
  }
  if (redact('phrase banale').includes('[masque:')) echecs.push('faux positif sur une chaine banale');

  return echecs;
}
