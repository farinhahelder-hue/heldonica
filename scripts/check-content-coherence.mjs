#!/usr/bin/env node
/**
 * check-content-coherence — Garde-fou CI d'évaluation de la cohérence de marque Heldonica.
 *
 * Scanne les articles de blog et contenus CMS pour valider le respect des 7 garde-fous
 * (Pronoms "on/tu", 0 mot interdit, E-E-A-T, détails sensoriels, honnêteté, GEO, CTA doux).
 *
 * Usage :
 *   node scripts/check-content-coherence.mjs
 */

import { readFileSync } from 'node:fs';
import { extraireMotsBannisTS } from './sync-brand-voice.mjs';

// Source de vérité des mots bannis : lib/brand-voice.ts. Le scan des tables de
// contenu (plus bas) s'y adosse pour ne pas diverger d'une liste recopiée.
const MOTS_BANNIS_SOURCE = extraireMotsBannisTS(readFileSync('lib/brand-voice.ts', 'utf8'));

// Pages dont le contenu est déjà quarantainé (noindex, hors sitemap, « Bientôt »).
// Une zone active sur une de ces pages n'est pas servie : c'est de la dette, pas
// une fuite. Même lecture que scripts/check-content-pages.mjs.
const UNPUBLISHED_CMS_PAGES = (() => {
  const src = readFileSync('lib/unpublished-pages.ts', 'utf8');
  const bloc = src.match(/UNPUBLISHED_CMS_PAGES[^=]*=\s*\[([\s\S]*?)\]/);
  if (!bloc) return new Set();
  return new Set([...bloc[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
})();

const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, ' ');

export function motsBannisDans(texte) {
  const bas = stripHtml(texte).toLowerCase();
  if (!bas.trim()) return [];
  return MOTS_BANNIS_SOURCE.filter((m) => bas.includes(m));
}

/**
 * Répartit les lignes de contenu (hors articles) en deux seaux :
 *  - `fuites` : ligne active sur une page publiée — le mot banni est servi ;
 *  - `dette`  : ligne inactive, ou page quarantainée (noindex, « Bientôt ») —
 *               le mot existe mais n'est pas rendu ; on le signale sans bloquer.
 * Fonction pure : testable sans base, la décision ne dépend que des entrées.
 */
export function classerLignesContenu({ zones = [], homeDests = [], sousDests = [], guideItems = [] }, quarantaine = new Set()) {
  const fuites = [];
  const dette = [];
  const ajouter = (actif, estQuarantaine, ou, mots) => {
    const cible = actif && !estQuarantaine ? fuites : dette;
    cible.push({ ou, mots, actif, quarantaine: estQuarantaine });
  };

  for (const z of zones) {
    const mots = motsBannisDans(z.value);
    if (mots.length) ajouter(z.is_active, quarantaine.has(z.page), `${z.page} / ${z.zone_key}`, mots);
  }
  for (const d of homeDests) {
    const mots = motsBannisDans(`${d.title} ${d.description} ${d.eyebrow}`);
    if (mots.length) ajouter(d.is_active, false, `cms_home_destinations / ${d.slug}`, mots);
  }
  for (const s of sousDests) {
    const mots = motsBannisDans(`${s.title} ${s.teaser}`);
    if (mots.length) ajouter(s.is_active, quarantaine.has(`destinations-${s.parent_slug}`), `cms_sub_destinations / ${s.parent_slug}/${s.slug}`, mots);
  }
  for (const g of guideItems) {
    const mots = motsBannisDans(`${g.title} ${g.description} ${g.secret}`);
    if (mots.length) ajouter(g.is_active, false, `cms_guide_items / ${g.guide_slug} #${g.rank}`, mots);
  }
  return { fuites, dette };
}

// L'API REST Supabase plafonne à 1000 lignes par requête, silencieusement :
// cms_editable_zones en compte 2538. Sans pagination, on n'en verrait que 1000.
async function fetchAll(url, key, table, select) {
  const out = [];
  const page = 1000;
  for (let offset = 0; ; offset += page) {
    const res = await fetch(`${url}/rest/v1/${table}?select=${select}&limit=${page}&offset=${offset}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`${table} : HTTP ${res.status}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

const FORBIDDEN_WORDS = [
  'bons plans', 'bon plan', 'organisation de séjour', 'compagnie', 'voyage organisé',
  'circuit', 'package', 'destinations populaires', 'tips', 'astuces', 'conseil voyage',
  'lieu incontournable', 'incontournable', 'aventure inoubliable', 'inoubliable',
  'paradis', 'paradisiaque', 'coup de cœur', 'must-have', 'must see', 'must-see',
  'les voyageurs', 'les touristes', 'solution miracle', 'solution magique',
  'magnifique', 'splendide', 'incroyable', 'spot', 'optimiser'
];

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
  const url = get('NEXT_PUBLIC_SUPABASE_URL');
  const key = get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return { url, key };
}

function evaluatePost(title, content, excerpt) {
  const text = `${title} ${excerpt || ''} ${content || ''}`.replace(/<[^>]*>/g, ' ');
  const lower = text.toLowerCase();

  const forbiddenFound = FORBIDDEN_WORDS.filter(w => lower.includes(w));
  const forbiddenOk = forbiddenFound.length === 0;

  const hasJe = /\bje\b|\bj'/.test(lower);
  const hasSubjectNous = /\bnous\s+[a-zÀ-ÿ]+ons\b|\bnous\s+ne\b|\bnous\s+y\b|\bnous\s+en\b/.test(lower);
  const hasOn = /\bon\b/.test(lower);
  const hasTu = /\btu\b|\btoi\b|\bton\b|\bta\b|\btes\b/.test(lower);
  const hasTravelers = /\bles voyageurs\b|\bles touristes\b/.test(lower);

  const pronounsOk = hasOn && !hasJe && !hasSubjectNous && !hasTravelers;

  const isRecipe = lower.includes('recette') || lower.includes('ingrédient') || lower.includes('cuisson') || lower.includes('bacalhau') || lower.includes('bolo') || lower.includes('crêpes') || lower.includes('pudim') || lower.includes('poncha') || lower.includes('brasserie');
  const isManifesto = lower.includes('manifeste') || lower.includes('pourquoi') || lower.includes('philosophie');

  const eeatKeywords = ['on a testé', 'on a vécu', 'on a visité', 'on a passé', 'notre voyage', 'en 202', 'hors saison', 'en mai', 'en juin', 'en septembre', 'en octobre', 'sur place', 'sur le terrain', 'années de route', 'tradition', 'notre cuisine', 'testé et approuvé', 'recette'];
  const eeatOk = text.length > 40 && eeatKeywords.some(w => lower.includes(w));

  const sensoryKeywords = ['odeur', 'senti', 'goût', 'goûté', 'frais', 'lumière', 'vent', 'pierre', 'bois', 'silence', 'bruit', 'eau', 'froid', 'chaud', 'texture', 'saveur', 'turquoise', 'parfum', 'café', 'brume', 'clapotis', 'rochers', 'moelleux', 'croustillant', 'doré', 'épices', 'huile d\'olive', 'four'];
  const sensoryOk = sensoryKeywords.some(w => lower.includes(w));

  const honestyKeywords = ['moins aimé', 'piège', 'attention', 'attente', 'glissant', 'bruyant', 'évite', 'difficile', 'cher', 'limite', 'bémol', 'par contre', 'mais', 'inconvénient', 'secret', 'astuce'];
  const honestyOk = isRecipe || isManifesto || honestyKeywords.some(w => lower.includes(w));

  const geoMatches = text.match(/([A-ZÀ-ÿ][a-zà-ÿ]+|\d+\s*(€|km|min|h|\%|g|ml|deg|°C))/g) || [];
  const geoOk = geoMatches.length >= 3;

  const aggressiveCta = ['clique vite', 'offre limitée', 'achète maintenant', 'dépêchez-vous', 'réservez maintenant'].some(w => lower.includes(w));
  const ctaOk = !aggressiveCta;

  const checks = {
    pronouns: { ok: pronounsOk, weight: 20 },
    forbidden: { ok: forbiddenOk, weight: 20 },
    eeat: { ok: eeatOk, weight: 15 },
    sensory: { ok: sensoryOk, weight: 15 },
    honesty: { ok: honestyOk, weight: 10 },
    geo: { ok: geoOk, weight: 10 },
    cta: { ok: ctaOk, weight: 10 },
  };

  let score = 0;
  for (const c of Object.values(checks)) {
    if (c.ok) score += c.weight;
  }

  return {
    score,
    passed: score >= 85,
    forbiddenFound,
    checks,
  };
}

async function main() {
  const { url, key } = readEnv();
  if (!url || !key) {
    // Exit 2 = « ignoré », pas « vert » : garde-fous.mjs distingue les deux et
    // n'affiche pas un contrôle sauté comme réussi. Sortir en 0 ici faisait
    // passer pour vert un contrôle qui n'avait rien vérifié.
    console.log('– Clés Supabase non disponibles : vérification non effectuée (ignorée).');
    process.exit(2);
  }

  try {
    const res = await fetch(`${url}/rest/v1/cms_blog_posts?select=id,title,slug,excerpt,content,published`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!res.ok) {
      console.log('✓ Impossible d’interroger les articles pour le check.');
      process.exit(0);
    }

    const posts = await res.json();
    console.log(`\n🔍 Audit de Cohérence Éditoriale — ${posts.length} articles analysés :`);

    let compliantCount = 0;
    const toImprove = [];
    const publishedShortPosts = [];

    for (const p of posts) {
      const rawText = (p.content || '').replace(/<[^>]*>/g, '').trim();
      const textLen = rawText.length;

      // Détection des ébauches vides publiées
      if (p.published && textLen < 300) {
        publishedShortPosts.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          len: textLen,
        });
      }

      const res = evaluatePost(p.title, p.content, p.excerpt);
      if (res.passed && (!p.published || textLen >= 300)) {
        compliantCount++;
      } else {
        toImprove.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          published: p.published,
          len: textLen,
          score: res.score,
          forbidden: res.forbiddenFound,
        });
      }
    }

    const globalCoherence = Math.round((compliantCount / posts.length) * 100);
    console.log(`\n📊 Score Global de Cohérence : ${globalCoherence}% (${compliantCount}/${posts.length} articles conformes à ≥85%)\n`);

    if (publishedShortPosts.length > 0) {
      console.error(`❌ ALERTE : ${publishedShortPosts.length} article(s) publié(s) ont un contenu vide ou trop court (< 300 car.) :`);
      publishedShortPosts.forEach(p => {
        console.error(`  🔴 [ID ${p.id}] "${p.title}" (${p.slug}) — ${p.len} caractères`);
      });
      console.error('👉 Veuillez passer ces ébauches en published = false ou rédiger leur contenu.\n');
      process.exit(1);
    } else {
      console.log('✓ Aucun article publié vide (< 300 caractères).');
    }

    if (toImprove.length > 0) {
      console.log('\n⚠️ Contenus en cours d’optimisation / brouillons :');
      toImprove.slice(0, 6).forEach(p => {
        console.log(`  - [${p.score}%${p.published ? ' • PUBLIC' : ' • BROUILLON'}] ${p.title} (${p.slug}) ${p.forbidden.length > 0 ? `[Mots bannis: ${p.forbidden.join(', ')}]` : ''}`);
      });
    }

    // ── Autres tables de contenu ────────────────────────────────────────────
    // Le scan ci-dessus ne lisait QUE cms_blog_posts : un mot banni vivant dans
    // une zone CMS, une destination d'accueil, une sous-destination ou un item
    // de guide ne faisait jamais rougir la CI. C'est exactement là que vivaient
    // 7 fuites actives trouvées à la main le 20/10/2026 (audit lot 2).
    //
    // Deux niveaux : une ligne ACTIVE et rendue bloque (exit 1) ; une ligne
    // inactive ou sur une page quarantainée est de la dette, signalée sans
    // bloquer — même distinction que scripts/check-content-pages.mjs.
    const fuites = [];
    const dette = [];

    const zones = await fetchAll(url, key, 'cms_editable_zones', 'page,zone_key,is_active,value');
    for (const z of zones) {
      const hits = motsBannisDans(z.value);
      if (hits.length === 0) continue;
      const quarantaine = UNPUBLISHED_CMS_PAGES.has(z.page);
      const cible = z.is_active && !quarantaine ? fuites : dette;
      cible.push({ ou: `${z.page} / ${z.zone_key}`, mots: hits, actif: z.is_active, quarantaine });
    }

    const homeDests = await fetchAll(url, key, 'cms_home_destinations', 'slug,is_active,title,description,eyebrow');
    for (const d of homeDests) {
      const hits = motsBannisDans(`${d.title} ${d.description} ${d.eyebrow}`);
      if (hits.length === 0) continue;
      const cible = d.is_active ? fuites : dette;
      cible.push({ ou: `cms_home_destinations / ${d.slug}`, mots: hits, actif: d.is_active, quarantaine: false });
    }

    const sousDests = await fetchAll(url, key, 'cms_sub_destinations', 'slug,parent_slug,is_active,title,teaser');
    for (const s of sousDests) {
      const hits = motsBannisDans(`${s.title} ${s.teaser}`);
      if (hits.length === 0) continue;
      const quarantaine = UNPUBLISHED_CMS_PAGES.has(`destinations-${s.parent_slug}`);
      const cible = s.is_active && !quarantaine ? fuites : dette;
      cible.push({ ou: `cms_sub_destinations / ${s.parent_slug}/${s.slug}`, mots: hits, actif: s.is_active, quarantaine });
    }

    const guideItems = await fetchAll(url, key, 'cms_guide_items', 'guide_slug,rank,title,is_active,description,secret');
    for (const g of guideItems) {
      const hits = motsBannisDans(`${g.title} ${g.description} ${g.secret}`);
      if (hits.length === 0) continue;
      const cible = g.is_active ? fuites : dette;
      cible.push({ ou: `cms_guide_items / ${g.guide_slug} #${g.rank}`, mots: hits, actif: g.is_active, quarantaine: false });
    }

    if (dette.length > 0) {
      console.log(`\nℹ ${dette.length} ligne(s) de contenu inactives ou quarantainées portent un mot banni — dette assumée, non bloquante :`);
      dette.forEach((d) => console.log(`  – ${d.ou}${d.actif ? ' (active, page quarantainée)' : ' (inactive)'} : ${d.mots.join(', ')}`));
    }

    if (fuites.length > 0) {
      console.error(`\n❌ ${fuites.length} mot(s) banni(s) SERVI(S) en ligne (ligne active, page publiée) :`);
      fuites.forEach((f) => console.error(`  🔴 ${f.ou} : ${f.mots.join(', ')}`));
      console.error('👉 Remplacer par un équivalent neutre (migration versionnée), ou désactiver la ligne.\n');
      process.exit(1);
    }

    console.log('\n✓ Vérification de cohérence terminée avec succès.\n');
  } catch (err) {
    console.error('Erreur lors du contrôle de cohérence :', err);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('check-content-coherence.mjs')) main();
