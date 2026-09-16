#!/usr/bin/env node
/**
 * generate_embeddings.mjs — Générateur d'embeddings vectoriels (Gemini 768d)
 * pour les 41 destinations et 50 articles Heldonica.
 *
 * Usage :
 *   node scripts/generate_embeddings.mjs [--export-sql] [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    serviceKey: get('SUPABASE_SERVICE_ROLE_KEY') || get('SUPABASE_SERVICE_KEY'),
    geminiKey: get('GEMINI_API_KEY'),
  };
}

const { url, serviceKey, geminiKey } = readEnv();

if (!url || !serviceKey) {
  console.error('✗ Configuration Supabase manquante dans .env.local');
  process.exit(1);
}

if (!geminiKey) {
  console.error('✗ GEMINI_API_KEY manquante dans .env.local');
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const genAI = new GoogleGenerativeAI(geminiKey);
const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function getEmbedding(text) {
  const clean = (text || '').trim().slice(0, 2048);
  if (!clean) return null;
  try {
    const res = await embedModel.embedContent({
      content: { parts: [{ text: clean }] },
      outputDimensionality: 768,
    });
    return res.embedding?.values || null;
  } catch (err) {
    console.error('Erreur embedding :', err.message);
    return null;
  }
}

async function main() {
  console.log('--- Heldonica : Vectorisation Sémantique (Gemini 768d) ---');

  const isExportSql = process.argv.includes('--export-sql');
  const isDryRun = process.argv.includes('--dry-run');

  // 1. Récupération des 41 destinations
  const { data: destinations, error: eDest } = await sb
    .from('destinations')
    .select('id, slug, title, country, region, excerpt, intro_narrative, local_insider_tips, tags, travel_style');

  if (eDest) {
    console.error('Erreur lecture destinations :', eDest.message);
    process.exit(1);
  }

  console.log(`\n📍 Destinations trouvées : ${destinations.length}`);

  const sqlStatements = [
    '-- Application des embeddings vectoriels Gemini (768 dimensions)',
    '-- Exécuter dans le SQL Editor Supabase si les colonnes ont été créées.',
  ];

  let destEmbedCount = 0;

  for (let i = 0; i < destinations.length; i++) {
    const d = destinations[i];
    const texte = [
      `Destination : ${d.title}`,
      d.country ? `Pays : ${d.country}` : '',
      d.region ? `Région : ${d.region}` : '',
      d.travel_style ? `Style : ${d.travel_style}` : '',
      d.excerpt ? `Résumé : ${d.excerpt}` : '',
      d.intro_narrative ? `Ambiance : ${d.intro_narrative}` : '',
      d.local_insider_tips ? `Conseils : ${d.local_insider_tips}` : '',
      d.tags?.length ? `Tags : ${d.tags.join(', ')}` : '',
    ].filter(Boolean).join('\n\n');

    process.stdout.write(`[${i + 1}/${destinations.length}] ${d.title.slice(0, 35)}... `);

    const vec = await getEmbedding(texte);
    if (vec && vec.length === 768) {
      destEmbedCount++;
      const vecStr = `[${vec.join(',')}]`;
      sqlStatements.push(`UPDATE public.destinations SET embedding = '${vecStr}'::vector WHERE id = '${d.id}';`);

      if (!isDryRun && !isExportSql) {
        const { error: updErr } = await sb
          .from('destinations')
          .update({ embedding: vecStr })
          .eq('id', d.id);

        if (updErr) {
          process.stdout.write(`⚠️ update direct bloqué (${updErr.message})\n`);
        } else {
          process.stdout.write(`✓ en base\n`);
        }
      } else {
        process.stdout.write(`✓ vectorisé\n`);
      }
    } else {
      process.stdout.write(`✗ échec embedding\n`);
    }

    // Petite pause pour respecter les quotas
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✓ Vectorisation terminée pour ${destEmbedCount}/${destinations.length} destinations.`);

  // Sauvegarde fichier SQL si demandé ou si update direct impossible
  const outputPath = resolve(process.cwd(), 'supabase/migrations/seed_embeddings_destinations.sql');
  writeFileSync(outputPath, sqlStatements.join('\n\n'), 'utf8');
  console.log(`💾 Script SQL exporté dans : ${outputPath}`);
}

main().catch(console.error);
