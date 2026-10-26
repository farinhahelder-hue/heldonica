#!/usr/bin/env node
/**
 * check-cms-emojis — détecte les emojis décoratifs **en base**.
 *
 * Pourquoi ce script existe
 * -------------------------
 * `check-design-tics.mjs` lit les fichiers du dépôt. Il ne voit pas la base.
 * Or une zone CMS peut porter un emoji qui n'existe nulle part dans le code :
 * la valeur vient de `cms_editable_zones`, et le rendu la prend telle quelle.
 *
 * C'est exactement ce qui s'est produit le 22/10 : la purge #687
 * (migration 20261022230000) visait la plage `2600-27BF + 10000-1FAFF`, alors
 * que le détecteur couvre AUSSI `231A-231B`, `23E9-23FF`, `2B1B-2B1C`, `2B50`
 * et `2B55`. Le sablier « ⌛ » de `highlight_2_emoji` est tombé dans ce trou :
 * refusé par la CI sur les fichiers, jamais vu en base. Le trou a été bouché le
 * 25/10 (migration 20261025200000), ce contrôle empêche sa réouverture.
 *
 * La plage Unicode vient du détecteur lui-même (`DECORATIVE_EMOJI_RE`) : une
 * seule source de vérité, pour que les deux garde-fous ne puissent plus diverger.
 *
 * Périmètre : `cms_editable_zones`, toutes pages. Une zone active est rendue au
 * visiteur : elle fait échouer le contrôle. Une zone inactive (`is_active=false`)
 * n'est pas rendue : elle est signalée sans casser le run, comme le veut la
 * sémantique du projet (« désactivé » vaut mieux qu'« inventé »).
 *
 * Usage :
 *   node scripts/check-cms-emojis.mjs
 *
 * Sortie : exit 1 si une zone ACTIVE porte un emoji ; exit 2 si les identifiants
 * Supabase manquent ou si la lecture échoue (« ignoré » n'est pas « réussi »).
 */

import { readFileSync } from 'node:fs';
import { DECORATIVE_EMOJI_RE } from './check-design-tics.mjs';

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

async function fetchBatch(url, key, from, pageSize, essai = 1) {
  try {
    const headers = { apikey: key, Range: `${from}-${from + pageSize - 1}` };
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
    const res = await fetch(
      `${url}/rest/v1/cms_editable_zones?select=page,zone_key,value,is_active&order=page,zone_key`,
      { headers }
    );
    if (!res.ok) {
      if (res.status >= 500 && essai < 3) {
        await new Promise((r) => setTimeout(r, 400 * essai));
        return fetchBatch(url, key, from, pageSize, essai + 1);
      }
      return { ok: false, status: res.status };
    }
    return { ok: true, batch: await res.json() };
  } catch (e) {
    if (essai < 3) {
      await new Promise((r) => setTimeout(r, 400 * essai));
      return fetchBatch(url, key, from, pageSize, essai + 1);
    }
    return { ok: false, error: e };
  }
}

function emojisDe(valeur) {
  if (typeof valeur !== 'string') return [];
  DECORATIVE_EMOJI_RE.lastIndex = 0;
  return [...valeur.matchAll(DECORATIVE_EMOJI_RE)].map((m) => m[0]);
}

async function main() {
  const { url, key } = readEnv();

  // PostgREST plafonne à 1000 lignes par réponse, sans le dire autrement que par
  // Content-Range : `cms_editable_zones` en compte plus de 2500.
  const PAGE_SIZE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const result = await fetchBatch(url, key, from, PAGE_SIZE);
    if (!result.ok) {
      console.error(
        `✗ Lecture de cms_editable_zones impossible (${result.status ? `HTTP ${result.status}` : result.error?.message || 'erreur réseau'}).`
      );
      process.exitCode = 2;
      return;
    }
    rows.push(...result.batch);
    if (result.batch.length < PAGE_SIZE) break;
  }

  const actives = [];
  const inactives = [];
  for (const r of rows) {
    const emojis = emojisDe(r.value);
    if (!emojis.length) continue;
    (r.is_active ? actives : inactives).push({ ...r, emojis });
  }

  if (inactives.length) {
    console.log(
      `  ${inactives.length} zone(s) inactive(s) portent un emoji (non rendue(s), non bloquant) :`
    );
    for (const r of inactives) {
      console.log(`      ${r.page} / ${r.zone_key} = ${JSON.stringify(r.value)}  ${r.emojis.join(' ')}`);
    }
  }

  if (actives.length) {
    console.error(`\n✗ ${actives.length} zone(s) ACTIVE(S) porte(nt) un emoji décoratif (rendue(s) en ligne) :`);
    for (const r of actives) {
      console.error(`    ${r.page} / ${r.zone_key} = ${JSON.stringify(r.value)}  ${r.emojis.join(' ')}`);
    }
    console.error(
      '\nUn emoji décoratif ne se corrige pas dans le code : la valeur vient de la base.\n' +
      'Écrire une migration versionnée (règle #2) qui normalise la zone, jamais un UPDATE à la main.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(`✓ check-cms-emojis : ${rows.length} zone(s) lue(s) en base, 0 emoji décoratif rendu.`);
  process.exitCode = 0;
}

if (process.argv[1] && process.argv[1].endsWith('check-cms-emojis.mjs')) {
  main();
}
