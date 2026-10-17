#!/usr/bin/env node
/**
 * check-hero-photos — détecte les zones hero_image en base valant un placeholder
 * alors que la page dans le code définit une vraie photo.
 *
 * S'inspire de check-cms-zones.mjs.
 *
 * Usage :
 *   node scripts/check-hero-photos.mjs
 *
 * Sortie :
 *   exit 0 : aucune photo hero masquée par un placeholder.
 *   exit 1 : au moins une page possède une vraie photo hero dans le code
 *            mais est masquée par un placeholder (/og-default.jpg) en base.
 *   exit 2 : identifiants Supabase absents (contrôle ignoré).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_DIRS = ['app', 'components'];
const EXTS = new Set(['.ts', '.tsx']);

function isPlaceholder(val) {
  if (!val) return true;
  const trimmed = val.trim();
  if (trimmed === '') return true;
  if (trimmed.endsWith('og-default.jpg')) return true;
  return false;
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
    console.error('✗ NEXT_PUBLIC_SUPABASE_URL et une clé Supabase sont requis pour check-hero-photos.');
    process.exit(2);
  }
  return { url, key };
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.next' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.has(extname(p))) out.push(p);
  }
  return out;
}

/** Collecte les fallbacks d'image hero par page depuis le code TypeScript. */
function collectHeroFallbacks() {
  const pageFallbacks = new Map(); // pageKey -> heroImage fallback string

  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8');

      // Déduire la page
      const pageConst = src.match(/const\s+PAGE\s*=\s*['"]([a-z0-9-]+)['"]/);
      let filePage = pageConst ? pageConst[1] : null;
      if (!filePage) {
        const literals = new Set(
          [...src.matchAll(/page="([^"]+)"/g)].map((m) => m[1])
        );
        if (literals.size === 1) filePage = [...literals][0];
      }

      // 1. <SubDestinationTemplate ... heroImage="..." />
      for (const m of src.matchAll(/heroImage=(?:"([^"]+)"|\{`([^`]+)`\}|\{['"]([^'"]+)['"]\})/g)) {
        const img = m[1] || m[2] || m[3];
        if (img && filePage) {
          pageFallbacks.set(filePage, img);
        }
      }

      // 2. <EditableZone ... zone="hero_image" ... fallback="..." />
      for (const m of src.matchAll(
        /<EditableZone[^>]*?page="([^"]+)"[^>]*?zone="hero_image"[^>]*?fallback=(?:"([^"]+)"|\{['"]([^'"]+)['"]\})/gs
      )) {
        const [, p, f1, f2] = m;
        const img = f1 || f2;
        if (p && img) {
          pageFallbacks.set(p, img);
        }
      }
    }
  }

  return pageFallbacks;
}

async function fetchZonesBatch(url, key, from, pageSize) {
  try {
    const headers = {
      apikey: key,
      Range: `${from}-${from + pageSize - 1}`,
    };
    if (key.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${key}`;
    }
    const res = await fetch(
      `${url}/rest/v1/cms_editable_zones?select=page,zone_key,value&zone_key=eq.hero_image&is_active=eq.true`,
      { headers }
    );
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    const batch = await res.json();
    return { ok: true, batch };
  } catch (e) {
    return { ok: false, error: e };
  }
}

async function main() {
  const { url, key } = readEnv();
  const heroFallbacks = collectHeroFallbacks();

  const result = await fetchZonesBatch(url, key, 0, 1000);
  if (!result.ok) {
    console.error(
      `✗ Lecture des zones hero_image impossible (${
        result.status ? `HTTP ${result.status}` : result.error?.message || 'erreur réseau'
      }).`
    );
    process.exitCode = 2;
    return;
  }

  const rows = result.batch || [];
  const maskedPhotos = [];

  for (const row of rows) {
    const codeFallback = heroFallbacks.get(row.page);
    // On s'intéresse aux pages où le code possède une VRAIE photo (non-placeholder)
    if (codeFallback && !isPlaceholder(codeFallback)) {
      // Si la zone en base vaut un placeholder, elle masque la vraie photo !
      if (isPlaceholder(row.value)) {
        maskedPhotos.push({
          page: row.page,
          codeFallback,
          dbValue: row.value,
        });
      }
    }
  }

  if (maskedPhotos.length > 0) {
    console.error(`\n✗ ${maskedPhotos.length} photo(s) hero réelle(s) masquée(s) par un placeholder en base :`);
    for (const item of maskedPhotos) {
      console.error(`    Page : ${item.page}`);
      console.error(`      - Photo dans le code : ${item.codeFallback}`);
      console.error(`      - Masquée par en base : ${item.dbValue}`);
    }
    console.error('\nSolution : mettre à jour cms_editable_zones avec la vraie URL ou laisser la zone à NULL.');
    process.exitCode = 1;
    return;
  }

  console.log('✓ Aucune photo hero masquée par un placeholder.');
  process.exitCode = 0;
}

main();
