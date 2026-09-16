#!/usr/bin/env node
/**
 * seed_agent_keys.mjs — Provisionne les clés API pour les agents IA Heldonica.
 *
 * Agents cibles :
 *  - Antigravity (IDE local)
 *  - Claude Code (CLI)
 *  - Pencode (éditeur distant)
 *  - Mobile APK (application mobile)
 *
 * Usage :
 *   node scripts/seed_agent_keys.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const AGENTS = [
  {
    name: 'antigravity',
    token: 'hld_ag_9f8b2c4e6a1d3f5e7b9a0c2d4e6f8a1b',
    prefix: 'hld_ag_',
    rate_limit: 120,
  },
  {
    name: 'claude',
    token: 'hld_cl_7e3a1b5c9d2f4e6a8b0c2d4f6e8a1b3c',
    prefix: 'hld_cl_',
    rate_limit: 120,
  },
  {
    name: 'pencode',
    token: 'hld_pe_4b6d8f0a2c4e6b8a1c3e5f7a9b1d3f5e',
    prefix: 'hld_pe_',
    rate_limit: 100,
  },
  {
    name: 'mobile_apk',
    token: 'hld_mb_1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b',
    prefix: 'hld_mb_',
    rate_limit: 150,
  },
];

function readEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  let raw = '';
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    try { raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8'); } catch {}
  }

  const get = (k) => {
    if (process.env[k]) return process.env[k];
    const m = raw.match(new RegExp('^\\s*' + k + '\\s*=\\s*(.*?)\\s*$', 'm'));
    return m ? m[1].replace(/^["']|["']$/g, '') : null;
  };

  return {
    url: get('NEXT_PUBLIC_SUPABASE_URL'),
    key: get('SUPABASE_SERVICE_ROLE_KEY') || get('SUPABASE_SERVICE_KEY'),
  };
}

function sha256(str) {
  return crypto.createHash('sha256').update(str.trim()).digest('hex');
}

async function main() {
  console.log('--- Provisionnement des Clés API Agents Heldonica ---\n');

  const { url, key } = readEnv();
  const rows = AGENTS.map((a) => ({
    name: a.name,
    key_prefix: a.prefix,
    key_hash: sha256(a.token),
    rate_limit: a.rate_limit,
    is_active: true,
  }));

  console.log('Clés provisionnées (à transmettre aux agents) :');
  for (const a of AGENTS) {
    console.log(`  * ${a.name.padEnd(12)} : ${a.token} (hash: ${sha256(a.token).slice(0, 16)}...)`);
  }
  console.log('');

  if (!url || !key) {
    console.warn('⚠ Variables Supabase manquantes dans .env.local.');
    printSql(rows);
    return;
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Test si la table api_keys existe
  const { error: testErr } = await sb.from('api_keys').select('id').limit(1);
  if (testErr) {
    console.log('ℹ La table `api_keys` n\'est pas encore créée en base (status/code:', testErr.code || testErr.message, ').');
    console.log('  Pour l\'amorcer dans l\'éditeur SQL Supabase avec la migration, voici le SQL à exécuter :\n');
    printSql(rows);
    return;
  }

  // Insertion ou mise à jour
  for (const row of rows) {
    const { data: existing, error: findErr } = await sb
      .from('api_keys')
      .select('id')
      .eq('key_hash', row.key_hash)
      .maybeSingle();

    if (findErr) {
      console.error(`✗ Erreur recherche pour ${row.name}:`, findErr.message);
      continue;
    }

    if (existing) {
      const { error: updErr } = await sb
        .from('api_keys')
        .update({ name: row.name, rate_limit: row.rate_limit, is_active: true })
        .eq('id', existing.id);
      if (updErr) console.error(`✗ Erreur mise à jour ${row.name}:`, updErr.message);
      else console.log(`✓ Clé ${row.name} déjà présente et mise à jour.`);
    } else {
      const { error: insErr } = await sb.from('api_keys').insert(row);
      if (insErr) console.error(`✗ Erreur insertion ${row.name}:`, insErr.message);
      else console.log(`✓ Clé ${row.name} insérée en base.`);
    }
  }

  console.log('\n✓ Initialisation terminée.');
}

function printSql(rows) {
  console.log('--- SQL D\'INSERTION DIRECTE (Supabase SQL Editor) ---');
  for (const r of rows) {
    console.log(`INSERT INTO public.api_keys (name, key_prefix, key_hash, rate_limit, is_active)
VALUES ('${r.name}', '${r.key_prefix}', '${r.key_hash}', ${r.rate_limit}, true)
ON CONFLICT (key_hash) DO UPDATE SET rate_limit = ${r.rate_limit}, is_active = true;`);
  }
  console.log('-----------------------------------------------------\n');
}

main().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
