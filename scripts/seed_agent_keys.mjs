#!/usr/bin/env node
/**
 * seed_agent_keys.mjs — Crée (ou fait tourner) les clés API des agents IA.
 *
 * Ce script ne contient aucun jeton et n'écrit pas en base : le 16/09/2026,
 * quatre jetons codés en dur ici, dans lib/ai-auth.ts et dans docs/API_IA.md
 * se sont retrouvés dans le dépôt public et ont dû être révoqués.
 *
 * Ce qu'il fait :
 *   1. génère un jeton aléatoire par agent (préfixe + 32 hex) ;
 *   2. écrit les jetons en clair dans `.agent-keys.local` (non versionné) —
 *      c'est le seul endroit où ils existent, à copier chez chaque agent ;
 *   3. écrit une migration versionnée qui désactive les clés actives de ces
 *      agents et insère les nouveaux hashes SHA-256 (jamais les jetons).
 *
 * Ensuite : `supabase db push --linked` applique la migration.
 *
 * Usage :
 *   node scripts/seed_agent_keys.mjs                 # les quatre agents
 *   node scripts/seed_agent_keys.mjs claude mobile_apk  # une partie seulement
 */

import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import crypto from 'node:crypto';

const AGENTS = [
  { name: 'antigravity', prefix: 'hld_ag_', rate_limit: 120 },
  { name: 'claude', prefix: 'hld_cl_', rate_limit: 120 },
  { name: 'pencode', prefix: 'hld_pe_', rate_limit: 100 },
  { name: 'mobile_apk', prefix: 'hld_mb_', rate_limit: 150 },
];

// Même fonction que lib/ai-auth.ts hashApiKey — les deux doivent rester alignées.
function sha256(str) {
  return crypto.createHash('sha256').update(str.trim()).digest('hex');
}

function horodatage() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

function main() {
  const demandes = process.argv.slice(2);
  const cibles = demandes.length ? AGENTS.filter((a) => demandes.includes(a.name)) : AGENTS;
  const inconnus = demandes.filter((n) => !AGENTS.some((a) => a.name === n));
  if (inconnus.length) {
    console.error(`Agents inconnus : ${inconnus.join(', ')} — connus : ${AGENTS.map((a) => a.name).join(', ')}`);
    process.exit(1);
  }

  const cles = cibles.map((a) => ({
    ...a,
    token: a.prefix + crypto.randomBytes(16).toString('hex'),
  }));

  // 1. Les jetons en clair, localement et nulle part ailleurs.
  const fichierLocal = resolve(process.cwd(), '.agent-keys.local');
  const lignes = [
    `# Jetons d'agent Heldonica générés le ${new Date().toISOString()} — NE PAS VERSIONNER.`,
    '# À copier chez chaque agent (variable HELDONICA_AI_KEY, en-tête x-api-key).',
    ...cles.map((c) => `${c.name}=${c.token}`),
    '',
  ];
  if (existsSync(fichierLocal)) {
    console.warn(`⚠ ${fichierLocal} existe déjà : les jetons y sont ajoutés, pas remplacés.`);
    writeFileSync(fichierLocal, '\n' + lignes.join('\n'), { flag: 'a' });
  } else {
    writeFileSync(fichierLocal, lignes.join('\n'));
  }

  // 2. La migration : désactivation des clés actives de ces agents, insertion des hashes.
  const noms = cles.map((c) => `'${c.name}'`).join(', ');
  const valeurs = cles
    .map((c) => `  ('${c.name}', '${c.prefix}', '${sha256(c.token)}', ${c.rate_limit}, true)`)
    .join(',\n');
  const sql = `-- Rotation des clés API agents : ${cles.map((c) => c.name).join(', ')}
-- Générée par scripts/seed_agent_keys.mjs le ${new Date().toISOString()}.
-- Les jetons ne sont pas ici (seulement leurs SHA-256) : ils sont dans
-- .agent-keys.local sur le poste qui a lancé le script.

UPDATE public.api_keys
SET is_active = false
WHERE name IN (${noms}) AND is_active;

INSERT INTO public.api_keys (name, key_prefix, key_hash, rate_limit, is_active)
VALUES
${valeurs}
ON CONFLICT (key_hash) DO UPDATE SET is_active = true, rate_limit = EXCLUDED.rate_limit;
`;
  const fichierMigration = resolve(process.cwd(), `supabase/migrations/${horodatage()}_rotate_api_keys.sql`);
  writeFileSync(fichierMigration, sql);

  console.log(`✓ ${cles.length} jeton(s) écrit(s) dans ${fichierLocal}`);
  console.log(`✓ Migration écrite : ${fichierMigration}`);
  console.log('  Appliquer avec : supabase db push --linked');
  console.log('  Les anciennes clés de ces agents seront désactivées à ce moment-là.');
}

main();
