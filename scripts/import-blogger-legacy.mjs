#!/usr/bin/env node
/**
 * import-blogger-legacy.mjs — importe les posts Blogger Heldonica absents du CMS, en brouillons.
 *
 * RÈGLE : le texte importé est l'original tel quel (HTML Blogger conservé,
 * comme les articles CMS existants). Aucune régénération, aucune invention.
 * - Jamais publié (published=false, status='draft').
 * - Jamais d'écrasement : slug déjà en base (publié OU brouillon) → ignoré + signalé.
 * - Provenance tracée (voice_notes + source_metadata, auto_generated=false : écrit humain).
 * - Dry-run par défaut, --go pour écrire.
 *
 * Usage :
 *   node scripts/import-blogger-legacy.mjs --feed content/voix/blogger-heldonica-feed.atom
 *   node scripts/import-blogger-legacy.mjs --feed <feed> --go
 */
import { readFileSync } from 'node:fs';

function readEnv() {
  let raw = '';
  for (const f of ['.env.local', '.env']) {
    try { raw = readFileSync(f, 'utf8'); break; } catch {}
  }
  const get = (k) => {
    if (process.env[k]) return process.env[k];
    const m = raw.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };
  return { url: get('NEXT_PUBLIC_SUPABASE_URL'), key: get('SUPABASE_SERVICE_ROLE_KEY') };
}

// Titres déjà présents dans le CMS (publiés ou brouillons, vérifié le 27/09) : on n'y touche pas.
const DEJA_LA = [
  'limmat', 'stoos', 'petite ceinture', 'mouffetard', 'crepes', 'crêpes',
  'riz sans gluten', 'instagram',
];
const VIDES_OU_PAGES = ['les bars trop cool', 'instagram'];

function slugify(t) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'sans-titre';
}
function strip(s) { return (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function norm(s) { return (s || '').toLowerCase(); }

async function main() {
  const args = process.argv.slice(2);
  const feedIdx = args.indexOf('--feed');
  const feedPath = feedIdx >= 0 ? args[feedIdx + 1] : 'content/voix/blogger-heldonica-feed.atom';
  const go = args.includes('--go');
  const { url, key } = readEnv();
  if (!url || !key) { console.error('[ERREUR] clés Supabase manquantes (.env)'); process.exit(1); }
  const H = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=representation' };

  const xml = readFileSync(feedPath, 'utf8');
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
  const existing = await (await fetch(`${url}/rest/v1/cms_blog_posts?select=slug`, { headers: H })).json();
  const slugsConnus = new Set(existing.map(r => r.slug));

  let crees = 0, ignores = 0;
  for (const e of entries) {
    const title = (e.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1]?.trim() || 'Sans titre';
    const published = ((e.match(/<published>([^<]*)<\/published>/) || [])[1] || '').slice(0, 10);
    const content = (e.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1]?.trim() || '';
    const cats = [...e.matchAll(/<category[^>]*term="([^"]*)"/g)].map(m => m[1]);
    const slug = slugify(title);
    const bas = norm(title + ' ' + slug);
    const dejaLa = DEJA_LA.some(k => bas.includes(k)) || slugsConnus.has(slug);
    const vide = content.length < 500 || VIDES_OU_PAGES.some(k => bas.includes(k));
    if (dejaLa) { console.log(`[SKIP déjà au CMS] ${title.slice(0, 60)}`); ignores++; continue; }
    if (vide) { console.log(`[SKIP vide/page] ${title.slice(0, 60)}`); ignores++; continue; }
    const payload = {
      title, slug,
      excerpt: strip(content).slice(0, 160),
      content, category: 'Carnets Voyage',
      tags: ['blogger-legacy', ...cats].slice(0, 8),
      author: 'Heldonica', published: false, status: 'draft',
      voice_notes: `Source : blog Blogger Heldonica, publié le ${published} — importé tel quel, jamais régénéré.`,
      auto_generated: false,
      source_metadata: { generateur: 'scripts/import-blogger-legacy.mjs', origine: 'feed.atom Blogger', publie_le: published },
    };
    if (!go) { console.log(`[DRY-RUN] créerait : « ${title.slice(0, 60)} » (${slug}, ${content.length} signes)`); crees++; continue; }
    const r = await fetch(`${url}/rest/v1/cms_blog_posts`, { method: 'POST', headers: H, body: JSON.stringify(payload) });
    if (r.status === 201) { console.log(`[OK] brouillon : ${slug}`); crees++; }
    else { console.log(`[ÉCHEC ${r.status}] ${slug} : ${(await r.text()).slice(0, 160)}`); }
  }
  console.log(go ? `\n${crees} créé(s), ${ignores} ignoré(s).` : `\n${crees} à créer, ${ignores} ignorés. Relance avec --go.`);
}
main().catch(e => { console.error('[ERREUR]', e.message); process.exit(1); });
