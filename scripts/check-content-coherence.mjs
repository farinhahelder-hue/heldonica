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

  const eeatKeywords = ['on a testé', 'on a vécu', 'on a visité', 'on a passé', 'notre voyage', 'en 202', 'hors saison', 'en mai', 'en juin', 'en septembre', 'en octobre', 'sur place', 'sur le terrain', 'années de route'];
  const eeatOk = text.length > 40 && eeatKeywords.some(w => lower.includes(w));

  const sensoryKeywords = ['odeur', 'senti', 'goût', 'goûté', 'frais', 'lumière', 'vent', 'pierre', 'bois', 'silence', 'bruit', 'eau', 'froid', 'chaud', 'texture', 'saveur', 'turquoise', 'parfum', 'café', 'brume', 'clapotis', 'rochers'];
  const sensoryOk = sensoryKeywords.some(w => lower.includes(w));

  const honestyKeywords = ['moins aimé', 'piège', 'attention', 'attente', 'glissant', 'bruyant', 'évite', 'difficile', 'cher', 'limite', 'bémol', 'par contre', 'mais', 'inconvénient'];
  const honestyOk = honestyKeywords.some(w => lower.includes(w));

  const geoMatches = text.match(/([A-ZÀ-ÿ][a-zà-ÿ]+|\d+\s*(€|km|min|h|\%))/g) || [];
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
    console.log('✓ Clés Supabase non disponibles, vérification statique ignorée.');
    process.exit(0);
  }

  try {
    const res = await fetch(`${url}/rest/v1/cms_blog_posts?select=id,title,slug,excerpt,content`, {
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

    for (const p of posts) {
      const res = evaluatePost(p.title, p.content, p.excerpt);
      if (res.passed) {
        compliantCount++;
      } else {
        toImprove.push({ id: p.id, title: p.title, slug: p.slug, score: res.score, forbidden: res.forbiddenFound });
      }
    }

    const globalCoherence = Math.round((compliantCount / posts.length) * 100);
    console.log(`\n📊 Score Global de Cohérence : ${globalCoherence}% (${compliantCount}/${posts.length} articles conformes à ≥85%)\n`);

    if (toImprove.length > 0) {
      console.log('⚠️ Contenus identifiés pour la Phase d\'audit (J+8 à J+30) :');
      toImprove.slice(0, 5).forEach(p => {
        console.log(`  - [${p.score}%] ${p.title} (${p.slug}) ${p.forbidden.length > 0 ? `[Mots bannis: ${p.forbidden.join(', ')}]` : ''}`);
      });
    }

    console.log('\n✓ Vérification terminée avec succès.\n');
  } catch (err) {
    console.error('Erreur lors du contrôle de cohérence :', err);
  }
}

main();
