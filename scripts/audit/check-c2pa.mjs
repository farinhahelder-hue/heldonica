#!/usr/bin/env node
/**
 * check-c2pa — détecte les images générées par IA d'après leur manifeste C2PA.
 *
 * Pourquoi : la règle #1 du projet interdit d'illustrer un vécu revendiqué par
 * une image fabriquée. Les générateurs (Gemini/Imagen) inscrivent dans le JPEG
 * un manifeste C2PA signé : `c2pa`, `trainedAlgorithmicMedia`, `SynthID`,
 * « Created by Google Generative AI ». Un EXIF absent ne prouve rien ; le
 * manifeste C2PA, lui, est une preuve.
 *
 * Usage : node scripts/audit/check-c2pa.mjs <url|fichier> [<url|fichier> …]
 * Sortie : une ligne par image — VERDICT, taille, indices trouvés.
 */
import { readFileSync } from 'node:fs';

const MARKERS = [
  ['c2pa', /c2pa/i],
  ['trainedAlgorithmicMedia', /trainedAlgorithmicMedia/],
  ['SynthID', /SynthID/i],
  ['Google Generative AI', /Google Generative AI/i],
  ['digitalSourceType', /digitalSourceType/],
];

export function inspectBuffer(buf) {
  const head = buf.subarray(0, Math.min(buf.length, 4_000_000)).toString('latin1');
  const found = MARKERS.filter(([, re]) => re.test(head)).map(([name]) => name);
  return { found, generated: found.length > 0 };
}

async function load(target) {
  if (/^https?:\/\//.test(target)) {
    const res = await fetch(target);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFileSync(target);
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Usage : node scripts/audit/check-c2pa.mjs <url|fichier> […]');
  process.exit(2);
}
let generated = 0;
for (const t of targets) {
  try {
    const buf = await load(t);
    const { found, generated: g } = inspectBuffer(buf);
    if (g) generated++;
    const verdict = g ? 'IA-GENEREE' : 'ok        ';
    console.log(`${verdict}  ${String(buf.length).padStart(9)} o  ${found.join(',') || '-'}  ${t}`);
  } catch (e) {
    console.log(`ERREUR      ${' '.repeat(9)}     ${e.message}  ${t}`);
  }
}
console.log(`\n${generated}/${targets.length} image(s) portant un manifeste d'IA.`);
