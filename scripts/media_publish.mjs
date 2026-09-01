#!/usr/bin/env node
/**
 * media_publish — dernier maillon : des photos du voyage aux zones CMS.
 *
 * Chaîne complète :
 *   1. photos_picker.py     Google Photos → public/images/destinations/<dest>/
 *   2. photos_evidence.py   EXIF → content/evidence/<dest>.json  (registre de preuves)
 *   3. media_publish.mjs    ← ici : upload Supabase + affectation aux zones
 *   4. check-content-evidence.mjs   refuse ce que les photos ne prouvent pas
 *
 * Une photo n'est posée sur une page que si son GPS place la prise de vue dans
 * la zone couverte par cette page. Sans preuve de localisation, on ne devine
 * pas : la zone garde son visuel de repli, ce qui reste préférable à une image
 * d'ailleurs présentée comme le lieu.
 *
 * Usage :
 *   node scripts/media_publish.mjs --dry-run      # montre le plan, n'écrit rien
 *   node scripts/media_publish.mjs                # upload + affectation
 *   node scripts/media_publish.mjs --dest roumanie --prefix destinations-roumanie
 */

import { readFileSync, existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const DRY = args.includes('--dry-run');
const DEST = arg('--dest', 'roumanie');
const PREFIX = arg('--prefix', `destinations-${DEST}`);
const EVIDENCE = arg('--evidence', `content/evidence/${DEST}.json`);
const MEDIA_DIR = arg('--media', `public/images/destinations/${DEST}`);
const BUCKET = arg('--bucket', 'media');

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Rattachement page → lieux. Le nom de page seul ne suffit pas : « apuseni »
 * n'apparaît dans aucun toponyme du registre, alors que Gârda de Sus ou
 * Scărișoara y sont. Les alias comblent cet écart.
 */
const ALIAS = {
  apuseni: ['garda de sus', 'scarisoara', 'ordancusa', 'padis', 'cucurbata',
            'pisoaia', 'vartop', 'poarta lui ionele', 'tauzului', 'bulbuci'],
  transylvanie: ['brasov', 'sibiu', 'sighisoara', 'cluj', 'alba iulia', 'bontida'],
  maramures: ['maramures', 'sighetu', 'barsana', 'sapanta'],
};

function lirEnv() {
  let raw = '';
  for (const f of ['.env.local', '.env']) {
    try { raw = readFileSync(f, 'utf8'); break; } catch {}
  }
  const get = k => process.env[k]
    ?? (raw.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
  return { url: get('NEXT_PUBLIC_SUPABASE_URL'), key: get('SUPABASE_SERVICE_ROLE_KEY') };
}

/** Zones image à alimenter, dans l'ordre de priorité. */
const ZONES = ['hero_image', 'seo_og_image'];

function scoreHero(m) {
  // Une bande large tient mieux dans un hero qu'un portrait ; une photo mieux
  // qu'une image extraite de vidéo.
  let s = 0;
  if (m.type === 'photo') s += 10;
  if (m.gps) s += 5;
  if (m.lieu_ecart_km != null) s += Math.max(0, 5 - m.lieu_ecart_km);
  return s;
}

async function main() {
  if (!existsSync(EVIDENCE)) {
    console.log(`\n⚠️  Registre absent : ${EVIDENCE}`);
    console.log('   Lance d\'abord :  python scripts/photos_evidence.py\n');
    process.exit(1);
  }

  const reg = JSON.parse(readFileSync(EVIDENCE, 'utf8'));
  const medias = (reg.medias ?? []).filter(m => m.lieu && m.type === 'photo');

  if (!medias.length) {
    console.log('\n⚠️  Aucune photo géolocalisée dans le registre.');
    console.log('   Sans GPS, impossible de rattacher une image à une page sans deviner.\n');
    process.exit(1);
  }

  const { url, key } = lirEnv();
  if (!url || !key) {
    console.log('\n⚠️  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.\n');
    process.exit(1);
  }

  const entetes = { apikey: key, Authorization: `Bearer ${key}` };

  // Zones image encore sur le visuel de repli.
  const res = await fetch(
    `${url}/rest/v1/cms_editable_zones?page=like.${PREFIX}*&zone_key=in.(${ZONES.join(',')})`
    + `&select=id,page,zone_key,value&is_active=is.true`,
    { headers: entetes });
  if (!res.ok) {
    console.log(`\n⚠️  Lecture des zones impossible : ${res.status} ${await res.text()}\n`);
    process.exit(1);
  }
  const zones = await res.json();

  // Regroupe les photos par page candidate.
  const parPage = {};
  for (const z of zones) {
    const suffixe = z.page.slice(PREFIX.length + 1);          // ex. « apuseni »
    if (!suffixe) continue;
    const cibles = [norm(suffixe), ...(ALIAS[suffixe] ?? []).map(norm)];
    const candidates = medias.filter(m => {
      const l = norm(m.lieu);
      return cibles.some(c => l.includes(c) || c.includes(l));
    });
    if (candidates.length) {
      (parPage[z.page] ??= { zones: [], photos: candidates })?.zones.push(z);
    }
  }

  const pagesTrouvees = Object.keys(parPage);
  console.log(`\n📸 Publication média — ${DEST}`);
  console.log(`   Registre : ${medias.length} photo(s) géolocalisée(s)`);
  console.log(`   Zones image sous ${PREFIX}* : ${zones.length}`);
  console.log(`   Pages avec photo correspondante : ${pagesTrouvees.length}\n`);

  const sansPhoto = [...new Set(zones.map(z => z.page))].filter(p => !parPage[p]);
  if (sansPhoto.length) {
    console.log(`   Sans photo du lieu (visuel de repli conservé) :`);
    for (const p of sansPhoto) console.log(`     · ${p}`);
    console.log('');
  }
  if (!pagesTrouvees.length) { console.log('Rien à publier.\n'); return; }

  const dejaEnvoye = new Map();

  for (const [page, { zones: zs, photos }] of Object.entries(parPage)) {
    const meilleure = [...photos].sort((a, b) => scoreHero(b) - scoreHero(a))[0];
    const fichier = join(MEDIA_DIR, meilleure.fichier);

    if (!existsSync(fichier)) {
      console.log(`   ⚠️  ${page} — fichier absent : ${meilleure.fichier}`);
      continue;
    }

    const cle = `destinations/${DEST}/${basename(meilleure.fichier)}`;
    let publicUrl = dejaEnvoye.get(cle);

    if (!publicUrl) {
      publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${cle}`;
      if (!DRY) {
        const corps = readFileSync(fichier);
        const ext = extname(fichier).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const up = await fetch(`${url}/storage/v1/object/${BUCKET}/${cle}`, {
          method: 'POST',
          headers: { ...entetes, 'Content-Type': mime, 'x-upsert': 'true' },
          body: corps,
        });
        if (!up.ok && up.status !== 409) {
          console.log(`   ⚠️  Upload échoué (${up.status}) : ${meilleure.fichier}`);
          continue;
        }
      }
      dejaEnvoye.set(cle, publicUrl);
    }

    console.log(`   ${page}`);
    console.log(`     photo  ${meilleure.fichier}  (${meilleure.lieu}`
      + `${meilleure.prise_de_vue ? ', ' + meilleure.prise_de_vue.slice(0, 10) : ''})`);

    for (const z of zs) {
      if (DRY) {
        console.log(`     ${z.zone_key} ← ${publicUrl.slice(-42)}  [simulation]`);
        continue;
      }
      const patch = await fetch(`${url}/rest/v1/cms_editable_zones?id=eq.${z.id}`, {
        method: 'PATCH',
        headers: { ...entetes, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ value: publicUrl, updated_at: new Date().toISOString() }),
      });
      console.log(patch.ok
        ? `     ${z.zone_key} ← ${publicUrl.slice(-42)}`
        : `     ⚠️  ${z.zone_key} : ${patch.status} ${await patch.text()}`);
    }
    console.log('');
  }

  console.log(DRY
    ? 'Simulation terminée — relance sans --dry-run pour appliquer.\n'
    : 'Publication terminée. Vérifie ensuite :  npm run check:content-evidence\n');
}

main().catch(e => { console.error(e); process.exit(1); });
