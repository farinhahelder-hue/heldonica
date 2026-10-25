#!/usr/bin/env node
/**
 * check-image-paths — garde-fou des chemins d'image locaux morts.
 *
 * Pourquoi ce script existe
 * -------------------------
 * Le 25/10/2026, trois pages destinations Madère (`porto-moniz`, `ponta-do-sol`,
 * `achadas-da-cruz`) passaient `heroImage="/images/destinations/madere/<f>.jpg"` :
 * des fichiers **jamais déposés dans `public/`**. Les pages répondaient 200, mais
 * le hero n'affichait rien, et le `image:` du JSON-LD (`TouristDestination`, lu par
 * Google) pointait une URL en 404. Même famille de chemins morts pour la Suisse et
 * la Roumanie, dans `cms-photo-albums.ts` et `cms-templates.ts`.
 *
 * Rien ne les voyait : les garde-fous lisaient la base, la prose, les tics visuels —
 * jamais la cohérence entre un chemin référencé et un fichier réellement présent.
 *
 * Ce qu'il fait
 * -------------
 * Collecte les chemins d'image **locaux** (`/images/…`, avec ou sans l'origine
 * `https://www.heldonica.fr`) référencés dans le code, et refuse ceux qui n'ont pas
 * de fichier correspondant dans `public/`.
 *
 * Ce qu'il ignore volontairement
 * ------------------------------
 * - **Les URL absolues vers un autre domaine** (`cdnjs.cloudflare.com`,
 *   `unpkg.com`, `*.supabase.co`, `images.unsplash.com`…) : elles ne dépendent pas
 *   de `public/`. Seul le domaine du site est traité comme local.
 * - **Les `placeholder` de formulaire** : une invite de saisie n'est pas une image
 *   servie. Un placeholder mort n'affiche pas d'image cassée.
 * - **Les chemins bâtis dynamiquement** (`${baseUrl}/images/…`) : hors champ, on ne
 *   peut pas les résoudre statiquement.
 *
 * Usage : node scripts/check-image-paths.mjs
 * Sortie : exit 1 dès le premier chemin mort.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Racines de code qui référencent des images. `middleware.ts` et `app/` couvrent le
// rendu, `lib/` les données de référence, `components/` les gabarits.
const RACINES = ['app', 'components', 'lib'];

const EXCLUS = ['__tests__', 'node_modules', '.next', '.git'];

// Deux formes de chemin local, traitées séparément :
//   1. une URL absolue de notre domaine : `https://www.heldonica.fr/images/…` ;
//   2. un chemin relatif nu : `/images/…`.
// Un chemin relatif n'est retenu que s'il n'est pas précédé d'un caractère de mot,
// d'un point, d'un `:` ou d'un `/` : cela écarte les imports npm et les URL d'un autre
// domaine qui *contiennent* `/images/…` (`cdnjs.cloudflare.com/…/images/marker-icon.png`,
// `leaflet/dist/images/marker-icon.png`) sans être servis depuis `public/`.
const EXT = 'jpg|jpeg|png|webp|avif|svg|gif';
const SUFFIXE = String.raw`/images/[A-Za-z0-9_./-]+\.(?:${EXT})`;
const CHEMIN_ABSOLU_RE = new RegExp(
  String.raw`https?://(?:www\.)?heldonica\.fr(${SUFFIXE})`,
  'gi'
);
const CHEMIN_RELATIF_RE = new RegExp(
  String.raw`(?<![\w.:/-])(${SUFFIXE})`,
  'g'
);

function estExclu(chemin) {
  const rel = chemin.replace(/\\/g, '/');
  return EXCLUS.some((e) => rel.split('/').includes(e));
}

function fichiers(racine, acc = []) {
  let st;
  try {
    st = statSync(racine);
  } catch {
    return acc;
  }
  if (st.isFile()) {
    if (/\.(ts|tsx)$/.test(racine) && !estExclu(racine)) acc.push(racine);
    return acc;
  }
  for (const e of readdirSync(racine)) {
    if (estExclu(e)) continue;
    fichiers(join(racine, e), acc);
  }
  return acc;
}

// Une invite de saisie n'est pas une image servie : `placeholder="/images/…"`.
// Le chemin est ignoré quand, juste avant lui, la ligne porte `placeholder=` / `:`.
function estPlaceholder(avant) {
  return /\bplaceholder\s*[=:]\s*["'`]?$/.test(avant);
}

const chemins = new Map(); // chemin -> Set("fichier:ligne")

for (const fichier of RACINES.flatMap((r) => fichiers(r))) {
  const source = readFileSync(fichier, 'utf8');
  source.split('\n').forEach((ligne, i) => {
    const trouves = [
      ...ligne.matchAll(CHEMIN_ABSOLU_RE),
      ...ligne.matchAll(CHEMIN_RELATIF_RE),
    ];
    for (const m of trouves) {
      if (estPlaceholder(ligne.slice(0, m.index))) continue;
      const chemin = m[1];
      if (!chemins.has(chemin)) chemins.set(chemin, new Set());
      chemins.get(chemin).add(`${fichier}:${i + 1}`);
    }
  });
}

const morts = [];
const manquantsConnus = [];

// Dette connue : fichiers référencés qui n'ont jamais été livrés, et qu'on ne peut pas
// remapper sans inventer une attribution. Chaque entrée porte sa raison et l'action
// attendue. Le garde-fou les signale sans échouer — mais **toute nouvelle** entrée
// absente de cette liste fait échouer le contrôle.
const MANQUANTS_CONNUS = new Map([
  [
    '/images/destinations/suisse/IMG_20250712_154207.jpg',
    'album suisse-stoos-2025 : fichier jamais livré. Les 4 photos réelles de Suisse ' +
      'sont dans le bucket blog-images (stoos-01..03.jpg — 3 distinctes, stoos-04.jpg ' +
      'est byte-identique à stoos-03.jpg). Leur correspondance avec les 4 légendes ' +
      '(Fronalpstock, Muotathal, coucher, nuit) est invérifiée — à réattribuer par le ' +
      'propriétaire.',
  ],
  [
    '/images/destinations/suisse/IMG_20250712_154303.jpg',
    'album suisse-stoos-2025 : fichier jamais livré (voir ci-dessus).',
  ],
  [
    '/images/destinations/suisse/AGC_20250712_194042959.jpg',
    'album suisse-stoos-2025 : fichier jamais livré (voir ci-dessus).',
  ],
  [
    '/images/destinations/suisse/AGC_20250712_220701363.jpg',
    'album suisse-stoos-2025 : fichier jamais livré (voir ci-dessus).',
  ],
]);

for (const [chemin, emplacements] of chemins) {
  if (existsSync(join('public', chemin))) continue;
  const raison = MANQUANTS_CONNUS.get(chemin);
  if (raison) {
    manquantsConnus.push({ chemin, raison });
  } else {
    morts.push({ chemin, emplacements: [...emplacements] });
  }
}

if (manquantsConnus.length > 0) {
  console.warn(`\n⚠ check-image-paths : ${manquantsConnus.length} chemin(s) en dette connue.\n`);
  for (const { chemin, raison } of manquantsConnus) {
    console.warn(`  - ${chemin}\n      ${raison}`);
  }
  console.warn('');
}

if (morts.length > 0) {
  console.error(
    `\n✗ check-image-paths : ${morts.length} chemin(s) d'image local(aux) sans fichier dans public/.\n`
  );
  for (const { chemin, emplacements } of morts) {
    console.error(`  - ${chemin}`);
    for (const e of emplacements) console.error(`      ${e}`);
  }
  console.error(
    '\n  Un chemin mort rend une image cassée (404) — ou, si une zone CMS le masque,\n' +
      '  un hero vide. Déposer le fichier dans public/, ou pointer une URL de stockage\n' +
      '  (vérifier alors `images.remotePatterns` dans next.config).\n'
  );
  process.exit(1);
}

console.log(
  `✓ check-image-paths : ${chemins.size} chemin(s) d'image local(aux) référencé(s), tous présents dans public/.`
);
process.exit(0);
