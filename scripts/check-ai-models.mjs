#!/usr/bin/env node
/**
 * check-ai-models — les modèles d'IA que le code appelle répondent-ils encore ?
 *
 * Un identifiant de modèle meurt sans prévenir : Groq a retiré les Llama 3.x,
 * Google a retiré Gemini 1.5 puis 2.0. Le 21/09/2026, toutes les fonctions IA
 * du panneau échouaient depuis des mois sans qu'un écran le dise. Ce script :
 *   1. lit GROQ_MODEL et GEMINI_MODEL dans lib/ai-provider.ts et les interroge
 *      avec les clés de .env.local (sans clé : « non testé », pas d'échec) ;
 *   2. refuse tout identifiant de modèle écrit en dur ailleurs dans app/api ou
 *      lib (la dérive commence toujours par un « model: '…' » de plus).
 *
 * Usage : node scripts/check-ai-models.mjs   (exit 1 si un modèle ne répond pas
 *         ou si un identifiant est écrit en dur hors de lib/ai-provider.ts)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const racine = process.cwd();
const env = {};
for (const f of ['.env.local', '.env']) {
  if (!existsSync(join(racine, f))) continue;
  for (const l of readFileSync(join(racine, f), 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const provider = readFileSync(join(racine, 'lib/ai-provider.ts'), 'utf8');
const GROQ_MODEL = provider.match(/export const GROQ_MODEL = '([^']+)'/)?.[1];
const GEMINI_MODEL = provider.match(/export const GEMINI_MODEL = '([^']+)'/)?.[1];
if (!GROQ_MODEL || !GEMINI_MODEL) {
  console.error('✗ GROQ_MODEL / GEMINI_MODEL introuvables dans lib/ai-provider.ts');
  process.exit(1);
}

let echecs = 0;

async function testeGroq() {
  const cle = env.GROQ_API_KEY;
  if (!cle) return console.log(`  ○ Groq ${GROQ_MODEL} : non testé (GROQ_API_KEY absente)`);
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: 'ok' }], max_tokens: 2 }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.choices) return console.log(`  ✓ Groq ${GROQ_MODEL} répond`);
  echecs++;
  console.log(`  ✗ Groq ${GROQ_MODEL} : ${j.error?.message ?? `HTTP ${r.status}`}`);
}

async function testeGemini() {
  const cle = env.GEMINI_API_KEY;
  if (!cle) return console.log(`  ○ Gemini ${GEMINI_MODEL} : non testé (GEMINI_API_KEY absente)`);
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${cle}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'ok' }] }], generationConfig: { maxOutputTokens: 2 } }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.candidates) return console.log(`  ✓ Gemini ${GEMINI_MODEL} répond`);
  echecs++;
  console.log(`  ✗ Gemini ${GEMINI_MODEL} : ${j.error?.message ?? `HTTP ${r.status}`}`);
}

function fichiers(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...fichiers(p));
    else if (/\.(ts|tsx|mjs)$/.test(e)) out.push(p);
  }
  return out;
}

// Identifiants en dur : « model: 'xxx' » ou « models/gemini-… » hors du fichier
// qui les centralise. Les modèles d'embedding et de transcription ont leur
// propre constante (lib/ai-embeddings.ts, whisper) et ne génèrent pas de texte.
const EXCEPTIONS = new Set(['lib/ai-provider.ts', 'lib/ai-embeddings.ts']);
const durs = [];
for (const f of [...fichiers(join(racine, 'app/api')), ...fichiers(join(racine, 'lib'))]) {
  const rel = f.slice(racine.length + 1).split('\\').join('/');
  if (EXCEPTIONS.has(rel)) continue;
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/model:\s*'([a-z0-9][a-z0-9./_-]+)'|models\/(gemini-[a-z0-9.-]+)/g)) {
    const id = m[1] ?? m[2];
    if (/whisper|embedding/.test(id)) continue;
    durs.push(`${rel} → ${id}`);
  }
}

console.log('check-ai-models');
await testeGroq();
await testeGemini();
if (durs.length) {
  console.log(`  ✗ ${durs.length} identifiant(s) de modèle écrit(s) en dur hors lib/ai-provider.ts :`);
  for (const d of durs) console.log(`      ${d}`);
} else {
  console.log('  ✓ aucun identifiant de modèle en dur hors lib/ai-provider.ts');
}
process.exit(echecs || durs.length ? 1 : 0);
