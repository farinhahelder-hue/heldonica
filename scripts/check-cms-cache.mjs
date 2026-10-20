#!/usr/bin/env node
/**
 * check-cms-cache — une page qui rend du contenu CMS doit avoir une fenêtre de
 * revalidation, sinon une correction en base n'atteint jamais le visiteur.
 *
 * Pourquoi ce script existe
 * -------------------------
 * Le 20/10/2026, sept mots bannis ont été purgés en base sur des pages
 * publiées. La base était propre, mais le site servait toujours l'ancien texte
 * (`x-vercel-cache: HIT`, `age ≈ 38 000 s`). Cause : les pages destinations
 * étaient prérendues **statiques sans `export const revalidate`** — donc mises
 * en cache pour toujours. Le CMS appelle `revalidateCmsTarget()` (lib/revalidate.ts)
 * à chaque écriture, mais cette revalidation ne sert à rien si la page n'a pas
 * de fenêtre : rien ne revalide une page qui n'expire jamais.
 *
 * La conséquence dépasse l'audit éditorial : *toute* correction de contenu
 * passée par le CMS sur ces pages restait invisible jusqu'au prochain
 * déploiement. Rien ne le signalait, parce qu'une page figée ressemble
 * exactement à une page fraîche.
 *
 * L'invariant vérifié ici est statique (aucune base, aucun réseau) : il tourne
 * donc dans le preflight, en une seconde.
 *
 *   Une page prérendue qui lit le contenu CMS doit avoir une fenêtre de
 *   revalidation — la sienne, ou celle d'un layout parent.
 *
 * Une page `'use client'` est hors périmètre : elle ne peut pas exporter
 * `revalidate` et va chercher son contenu côté navigateur.
 *
 * Usage : node scripts/check-cms-cache.mjs
 * Sortie : exit 1 dès la première page sans fenêtre.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const APP = 'app';

/**
 * Pages dispensées de fenêtre, avec la raison. Une exemption sans raison écrite
 * rouvre l'angle mort que ce script existe pour fermer.
 */
const EXEMPT = new Map([
  [
    'app/maintenance/page.tsx',
    "Page de maintenance : son affichage est piloté par site_settings.maintenance_mode, pas par le contenu éditorial. Ne pas la rendre expirante sans décision explicite.",
  ],
]);

/** Accesseurs de contenu CMS. Un import ou un appel à l'un d'eux suffit. */
const ACCESSEURS = [
  'getPageZones',
  'getGlobalZones',
  'getCmsOrSetting',
  'getZoneLinks',
  'getSiteSettings',
  'getGuideItems',
];

const MOTIF_ACCESSEUR = new RegExp(`\\b(${ACCESSEURS.join('|')})\\b`);

function lirePages(dir, out = []) {
  let entrees;
  try {
    entrees = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entrees) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      lirePages(p, out);
    } else if (e === 'page.tsx' || e === 'page.ts') {
      out.push(p);
    }
  }
  return out;
}

function lire(p) {
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

/** Une page `'use client'` est rendue côté navigateur : pas de fenêtre à exiger. */
function estClient(src) {
  return /^\s*(['"])use client\1/.test(src);
}

function estDynamique(src) {
  return /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(src);
}

/** Fenêtre exportée par ce fichier, ou null. `revalidate = 0` compte (rendu dynamique). */
function fenetrePropre(src) {
  const m = src.match(/export\s+const\s+revalidate\s*=\s*([0-9]+)/);
  return m ? Number(m[1]) : null;
}

/**
 * Fenêtre héritée des layouts parents (app/<seg>/layout.tsx → app/layout.tsx).
 * Next.js fait descendre `revalidate` d'un layout vers ses enfants : c'est le
 * mécanisme qui a permis de couvrir les ~70 pages destinations d'un coup.
 */
function fenetreHeritee(fichier) {
  let dossier = dirname(fichier);
  while (dossier.startsWith(APP)) {
    const layout = ['layout.tsx', 'layout.ts'].map((n) => join(dossier, n)).find(existsSync);
    if (layout) {
      const w = fenetrePropre(lire(layout));
      if (w !== null) return { valeur: w, source: layout };
    }
    if (dossier === APP) break;
    dossier = dirname(dossier);
  }
  return null;
}

/**
 * Décide si une page doit être signalée. Fonction pure : toute la logique
 * testable est ici, l'entrée/sortie reste en bas de fichier.
 *
 * @param {{ src: string, fenetreHeritee: number|null, exempte: boolean }} p
 * @returns {boolean} true si la page est figée pour toujours.
 */
export function pageFigee({ src, fenetreHeritee: heritee, exempte }) {
  if (exempte) return false;
  if (estClient(src)) return false;
  if (estDynamique(src)) return false;
  if (!MOTIF_ACCESSEUR.test(src)) return false;
  if (fenetrePropre(src) !== null) return false;
  if (heritee !== null) return false;
  return true;
}

/** Exécution en ligne de commande uniquement (le test importe ce module). */
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-cms-cache.mjs')) {
  const pages = lirePages(APP).sort();
  const problemes = [];

  for (const p of pages) {
    const src = lire(p);
    const heritee = fenetreHeritee(p);
    if (
      pageFigee({
        src,
        fenetreHeritee: heritee ? heritee.valeur : null,
        exempte: EXEMPT.has(p),
      })
    ) {
      problemes.push({ fichier: relative(process.cwd(), p).replace(/\\/g, '/') });
    }
  }

  if (problemes.length === 0) {
    console.log(
      `  ✓ ${pages.length} page(s) inspectée(s) : toute page lisant le CMS a une fenêtre de revalidation.`
    );
    process.exit(0);
  }

  console.log(`  ✗ ${problemes.length} page(s) figée(s) pour toujours :\n`);
  for (const p of problemes) {
    console.log(`    ${p.fichier}`);
  }
  console.log('\n  Ces pages lisent le contenu CMS mais n\'expirent jamais : une correction');
  console.log('  en base restera invisible jusqu\'au prochain déploiement. Ajouter');
  console.log('  `export const revalidate = 300;` à la page, ou à son layout parent');
  console.log('  (app/<segment>/layout.tsx) pour couvrir tout le segment.');
  process.exit(1);
}
