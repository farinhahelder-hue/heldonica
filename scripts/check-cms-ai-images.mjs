#!/usr/bin/env node
/**
 * check:cms-ai-images — refuse les images générées par IA dans public/.
 *
 * Règle n°1 d'Heldonica : on n'invente rien. Une image générée ne peut pas
 * illustrer un voyage vécu. Le manifeste C2PA signé par le générateur est la
 * preuve vérifiable : il survit à la copie du fichier, pas toujours à une
 * recompression, d'où le second marqueur (digitalSourceType).
 *
 * Usage :
 *   node scripts/check-cms-ai-images.mjs            # public/images
 *   node scripts/check-cms-ai-images.mjs public/    # autre racine
 *
 * Sortie : 0 si aucune image générée, 1 sinon (liste des fichiers fautifs).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = process.argv[2] || 'public/images';
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

/** Marqueurs binaires d'un contenu généré (ASCII, insensibles à la casse). */
const MARQUEURS = [
  'c2pa',
  'trainedalgorithmicmedia',
  'digitalsourcetype',
  'google c2pa',
];

function fichiers(dossier) {
  const sortie = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) sortie.push(...fichiers(chemin));
    else if (EXTENSIONS.has(entree.name.slice(entree.name.lastIndexOf('.')).toLowerCase())) {
      sortie.push(chemin);
    }
  }
  return sortie;
}

function estGeneree(chemin) {
  const octets = readFileSync(chemin);
  const texte = octets.toString('latin1').toLowerCase();
  const trouves = MARQUEURS.filter((m) => texte.includes(m));
  return trouves;
}

let dossier;
try {
  dossier = statSync(RACINE).isDirectory() ? RACINE : null;
} catch {
  dossier = null;
}

if (!dossier) {
  console.log(`– ${RACINE} absent : rien à contrôler.`);
  process.exit(0);
}

const fautives = [];
for (const chemin of fichiers(dossier)) {
  const marqueurs = estGeneree(chemin);
  if (marqueurs.length) fautives.push({ chemin, marqueurs });
}

if (fautives.length === 0) {
  console.log(`✓ Aucune image générée détectée dans ${RACINE}.`);
  process.exit(0);
}

console.error(`✗ ${fautives.length} image(s) générée(s) par IA dans ${RACINE} :`);
for (const { chemin, marqueurs } of fautives) {
  const ko = Math.round(statSync(chemin).size / 1024);
  console.error(`    ${relative(process.cwd(), chemin)} (${ko} Ko) — ${marqueurs.join(', ')}`);
}
console.error(`
Ces fichiers portent un manifeste C2PA de générateur. Ils ne peuvent pas
illustrer un voyage vécu (AGENTS.md, règle n°1). À faire :
  - les supprimer du dépôt ;
  - remplacer leurs références (fallbacks, albums, templates) par une photo
    de terrain dont l'EXIF prouve la prise de vue ;
  - ne jamais réutiliser leur URL Supabase, même si l'objet y existe encore.
`);
process.exit(1);
