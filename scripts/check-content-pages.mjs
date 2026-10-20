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

// Périmètre : pages destinations + guides + pages commerciales, et le
// composant partagé LeadMagnetBlock — il porte le copy de trois pages d'un
// coup, et vivre hors périmètre, sa prose n'était jamais contrôlée.
const ROOTS = [
  'app/destinations',
  'app/a-propos',
  'app/expert-hotelier',
  'app/guides',
  'app/travel-planning',
  'lib/pillar-data.ts',
  'components/LeadMagnetBlock.tsx',
];

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
  const m = fichier.replace(/\\/g, '/').match(/^app(\/.*)\/page\.tsx$/);
  return m ? m[1] : null;
}

// On ne juge que de la prose : un identifiant de code (`spot`,
// `filteredSpots`) n'est pas une phrase. Le seuil reste volontairement bas —
// un libellé d'un mot (fallback « Incontournable ») est du texte visible, et
// c'était l'angle mort du 18/10. estProse élimine de toute façon les
// identifiants en minuscules et les chemins.
const STRING_RE = /(["'])((?:\\.|(?!\1).)*)\1/g;
const MIN_WORDS = 1;

// Texte JSX brut : `<h2>Aperçu du circuit</h2>` ne contient aucune chaîne
// entre guillemets, STRING_RE ne le voit pas. On attrape ce qui est entre
// `>` et `<` — les expressions `{...}` restent hors champ.
const JSX_TEXT_RE = />([^<>{}]+)</g;

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

// Lignes structurellement non éditoriales : imports, données structurées
// JSON-LD. Elles font sauter la ligne entière, chaînes comme texte JSX.
const SKIP_LINE = ['import ', 'from ', '"@context"', 'schema.org'];

// Valeurs d'attributs techniques : `<span className=...>{Z(..., "texte")}`
// n'est PAS une ligne à sauter — seule la valeur de l'attribut l'est. On la
// reconnaît à ce que l'ouverture de la chaîne est immédiatement précédée de
// `attribut=`. Passer par SKIP_LINE sur toute la ligne masquait au passage
// les fallbacks EditableZone, qui vivent presque toujours sur une ligne
// marquée d'un className (angle mort constaté le 18/10).
const ATTR_TECH =
  /(?:[\s{(])(?:className|class|aria-[\w-]+|data-[\w-]+|placeholder(?:-[\w]+)*|style)\s*=\s*$/;

// Les données structurées JSON-LD vivent dans un <script> : elles ne sont
// pas du texte visible. On retire ces blocs avant de scanner le JSX — un
// test sur chaque ligne sauterait tout fichier contenant un import.
const JSON_LD_RE = /<script[^>]*>[\s\S]*?<\/script>/g;

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

function juger(cible, fichier, numero, texte, guillemets) {
  if (texte.length < 2) return;

  // Un fragment de brouillon fait une ou deux capitalisées suivies d'un
  // point (« Grec. », « Dunes. »). Il faut le juger AVANT le filtre de
  // prose : avec moins de trois mots, il passerait pour un identifiant de
  // code et échapperait au contrôle — c'était l'angle mort du 16/10.
  //
  // Chaînes uniquement : c'est là que dorment les valeurs de zones CMS.
  // Un titre JSX inline (`<strong>Indispensable.</strong>`) n'est pas une
  // description réduite — le juger comme tel serait un faux positif.
  if (guillemets && FRAGMENT_RE.test(texte) && !/^[./@#]|https?:|\{[^}]*\}$/.test(texte)) {
    cible.push({
      fichier, numero, type: 'fragment de brouillon',
      detail: `description réduite à un fragment : « ${texte} »`,
    });
  }

  if (!estProse(texte)) return;
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

function numeroLigne(source, index) {
  let n = 1;
  for (let i = 0; i < index; i++) if (source[i] === '\n') n++;
  return n;
}

for (const fichier of ROOTS.flatMap((r) => fichiers(r))) {
  const url = cheminVersUrl(fichier);
  const quarantaine = url !== null && UNPUBLISHED.has(url);
  const cible = quarantaine ? quarantaines : problemes;
  const source = readFileSync(fichier, 'utf8');

  // 1. Chaînes entre guillemets, jugées ligne à ligne : SKIP_LINE et
  //    ATTR_TECH dépendent du contexte de la ligne (imports, attributs).
  source.split('\n').forEach((ligne, i) => {
    if (SKIP_LINE.some((m) => ligne.includes(m))) return;
    const numero = i + 1;
    for (const m of ligne.matchAll(STRING_RE)) {
      if (ATTR_TECH.test(ligne.slice(0, m.index))) continue;
      juger(cible, fichier, numero, m[2].replace(/\\n/g, ' ').trim(), true);
    }
  });

  // 2. Texte JSX brut, sur le fichier entier : un paragraphe peut tenir sur
  //    sa propre ligne, sans `>` ni `<` autour — une lecture ligne à ligne
  //    (l'angle mort du 18/10) le raterait. Le JSON-LD sort d'abord, mais en
  //    conservant ses sauts de ligne pour ne pas décaler les numéros.
  const jsx = source.replace(JSON_LD_RE, (bloc) => bloc.replace(/[^\n]/g, ''));
  for (const m of jsx.matchAll(JSX_TEXT_RE)) {
    juger(cible, fichier, numeroLigne(jsx, m.index), m[1].replace(/\s+/g, ' ').trim(), false);
  }
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
