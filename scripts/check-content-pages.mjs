#!/usr/bin/env node
/**
 * check-content-pages — garde-fou éditorial des pages statiques.
 *
 * Pourquoi ce script existe
 * -------------------------
 * Le 11/10/2026, un audit des pages destinations a montré deux dérives que rien
 * n'attrapait :
 *
 *   1. Des mots bannis (au sens de FORBIDDEN_WORDS, lib/brand-voice.ts) présents
 *      dans la prose des pages : « plages fluviales incroyables », « Le matin
 *      incontournable », « villages magnifiques »… Or `check:content-coherence`
 *      ne scanne que les articles Supabase, et affiche « ✓ » sans rien vérifier
 *      quand les clés Supabase manquent — donc en local, il ne voit rien.
 *
 *   2. Des fragments de brouillon issus du générateur de zones CMS (commit
 *      ad58c936) : descriptions réduites à un mot suivi d'un point (« Grec. »,
 *      « Dunes. ») et intro en anglais (« …the theatre grec… Incredible. »).
 *
 * Ce contrôle est statique (aucune base, aucun réseau) : il tourne dans le
 * preflight en une seconde.
 *
 * Source de vérité des mots bannis : lib/brand-voice.ts, via l'extracteur
 * partagé de scripts/sync-brand-voice.mjs — pour qu'une mise à jour de la liste
 * se propage sans duplication.
 *
 * Usage : node scripts/check-content-pages.mjs
 * Sortie : exit 1 dès la première dérive.
 */

import { readFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { extraireMotsBannisTS } from './sync-brand-voice.mjs';

const ROOTS = ['app/destinations', 'app/a-propos', 'app/expert-hotelier', 'lib/pillar-data.ts'];

// Pages dont le contenu est déjà quarantainé (noindex, hors sitemap, page « Bientôt »)
// une réécriture sur vécu réel : lib/unpublished-pages.ts. On n'exige pas d'elles
// une prose propre — elles ne sont pas publiées, et leur gabarit rend une page
// « Bientôt » au lieu du brouillon — mais on les signale pour que la dette reste visible.
const UNPUBLISHED = (() => {
  const src = readFileSync('lib/unpublished-pages.ts', 'utf8');
  const bloc = src.match(/UNPUBLISHED_PATHS[^=]*=\s*\[([\s\S]*?)\]/);
  if (!bloc) return new Set();
  return new Set([...bloc[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
})();

function cheminVersUrl(fichier) {
  const m = fichier.match(/^app(\/.*)\/page\.tsx$/);
  return m ? m[1] : null;
}

// On ne juge que de la prose visible : chaînes de ≥ 3 mots. Un identifiant de
// code (`spot`, `filteredSpots`) n'est pas une phrase.
const STRING_RE = /(["'])((?:\\.|(?!\1).)*)\1/g;
const MIN_WORDS = 3;

// Marqueurs de brouillon : un fragment d'une ou deux capitalisées suivi d'un point.
const FRAGMENT_RE = /^[A-ZÀ-Ý][\wà-ÿ'-]{1,20}(?:\s+[a-zà-ÿ]{2,12})?\.$/;

// Anglais laissé dans un texte français. Frontières de mots obligatoires : sans
// elles, « tourism » matche « agritourisme » et « Est. » matche le verbe « est ».
const ANGLICISMES = [
  { motif: /\bIncredible\b/, libelle: 'Incredible' },
  { motif: /\bAmazing\b/, libelle: 'Amazing' },
  { motif: /\bBeautiful\b/, libelle: 'Beautiful' },
  { motif: /\bWonderful\b/, libelle: 'Wonderful' },
  { motif: /\bStunning\b/, libelle: 'Stunning' },
  { motif: /\bBeach\b/, libelle: 'Beach' },
  { motif: /\btourism\b/, libelle: 'tourism' },
  { motif: /\bTheatre\b/, libelle: 'Theatre' },
  // « Est. » n'est un marqueur de brouillon qu'en tête de chaîne : « l'Est. »
  // en fin de phrase est du français normal.
  { motif: /^Est\.\s/, libelle: 'Est. (préfixe de brouillon)' },
];

// Champs techniques où le mot n'est pas éditorial.
const SKIP_LINE = [
  'placeholder:text', 'className', 'aria-', 'data-', 'import ', 'from ',
  '"@context"', 'schema.org', // données structurées JSON-LD
];

function fichiers(racine, acc = []) {
  let st;
  try {
    st = statSync(racine);
  } catch {
    return acc;
  }
  if (st.isFile()) {
    if (racine.endsWith('.ts') || racine.endsWith('.tsx')) acc.push(racine);
    return acc;
  }
  for (const e of readdirSync(racine)) {
    if (e === 'node_modules' || e === '__tests__' || e.startsWith('.')) continue;
    fichiers(join(racine, e), acc);
  }
  return acc;
}

function estProse(s) {
  const mots = s.trim().split(/\s+/);
  if (mots.length < MIN_WORDS) return false;
  // Un chemin, une URL, un sélecteur : pas de la prose.
  if (/^[./@#]|^https?:|\{[^}]*\}$/.test(s)) return false;
  if (/^[a-z][a-zA-Z0-9_]*$/.test(s)) return false;
  return true;
}

const MOTS_BANNIS = extraireMotsBannisTS(readFileSync('lib/brand-voice.ts', 'utf8'));
const problemes = [];
const quarantaines = [];

for (const fichier of ROOTS.flatMap((r) => fichiers(r))) {
  const url = cheminVersUrl(fichier);
  const quarantaine = url !== null && UNPUBLISHED.has(url);
  const cible = quarantaine ? quarantaines : problemes;
  const lignes = readFileSync(fichier, 'utf8').split('\n');
  lignes.forEach((ligne, i) => {
    if (SKIP_LINE.some((m) => ligne.includes(m))) return;
    const numero = i + 1;

    for (const m of ligne.matchAll(STRING_RE)) {
      const texte = m[2].replace(/\\n/g, ' ').trim();
      if (texte.length < 2) continue;

      // Un fragment de brouillon fait une ou deux capitalisées suivies d'un
      // point (« Grec. », « Dunes. »). Il faut le juger AVANT le filtre de
      // prose : avec moins de trois mots, il passerait pour un identifiant de
      // code et échapperait au contrôle — c'était l'angle mort du 16/10.
      if (FRAGMENT_RE.test(texte) && !/^[./@#]|https?:|\{[^}]*\}$/.test(texte)) {
        cible.push({
          fichier, numero, type: 'fragment de brouillon',
          detail: `description réduite à un fragment : « ${texte} »`,
        });
      }

      if (!estProse(texte)) continue;
      const bas = texte.toLowerCase();

      for (const mot of MOTS_BANNIS) {
        if (bas.includes(mot)) {
          cible.push({
            fichier, numero, type: 'mot banni',
            detail: `« ${mot} » dans : ${texte.slice(0, 90)}`,
          });
        }
      }

      for (const ang of ANGLICISMES) {
        if (ang.motif.test(texte)) {
          cible.push({
            fichier, numero, type: 'anglicisme',
            detail: `« ${ang.libelle} » dans : ${texte.slice(0, 90)}`,
          });
        }
      }
    }
  });
}

// Les pages quarantainées ne font pas échouer le contrôle : elles sont hors index.
if (quarantaines.length > 0) {
  const pages = new Set(quarantaines.map((q) => q.fichier));
  console.log(
    `  ℹ ${pages.size} page(s) en quarantaine (noindex, hors sitemap, page « Bientôt ») — ` +
    `dette assumée, ` +
    `non bloquante : ${quarantaines.length} dérive(s) dans lib/unpublished-pages.ts.`
  );
}

if (problemes.length === 0) {
  console.log(`  ✓ Aucune dérive éditoriale dans les pages publiées (${MOTS_BANNIS.length} mots bannis surveillés).`);
  process.exit(0);
}

console.log(`  ✗ ${problemes.length} dérive(s) éditoriale(s) :\n`);
let courant = '';
for (const p of problemes) {
  if (p.fichier !== courant) {
    console.log(`    ${p.fichier}`);
    courant = p.fichier;
  }
  console.log(`      L${p.numero}  [${p.type}]  ${p.detail}`);
}
console.log('\n  Corriger la prose, ou retirer la page du sitemap si le contenu n\'est pas prêt');
console.log('  (lib/unpublished-pages.ts).');
process.exit(1);
