#!/usr/bin/env node
/**
 * check:cms-ai-images — refuse les images générées par IA dans public/, et
 * les références de code à une image générée rangée dans le stockage.
 *
 * Règle n°1 d'Heldonica : on n'invente rien. Une image générée ne peut pas
 * illustrer un voyage vécu. Le manifeste C2PA signé par le générateur est la
 * preuve vérifiable : il survit à la copie du fichier, pas toujours à une
 * recompression, d'où le second marqueur (digitalSourceType).
 *
 * Usage :
 *   node scripts/check-cms-ai-images.mjs            # public/ (tout ce qui est servi)
 *   node scripts/check-cms-ai-images.mjs public/images   # une sous-racine
 *
 * La racine par défaut est `public/`, pas `public/images/` : les posters de
 * capsule vidéo vivent sous `public/videos/` et sont tout aussi servis. Scanner
 * `public/images` seul laissait ces posters hors du contrôle — un poster de
 * couverture fabriqué serait passé en CI (constat du 30/10/2026, PR #791).
 *
 * Second contrôle, ajouté le 30/10/2026 : les octets vivent aussi hors du
 * dépôt. Une image générée rangée dans le bucket Supabase ne peut pas être lue
 * en CI, mais son URL, si — et six références de code pointaient encore vers
 * les cinq visuels de Madère après une purge annoncée « définitive ». Le
 * manifeste est donc vérifié sur les fichiers, et les URL connues pour être
 * générées sont refusées dans le code (`app`, `components`, `lib`, mobile).
 *
 * Sortie : 0 si aucune image générée, 1 sinon (liste des fichiers fautifs).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = process.argv[2] || 'public';
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

/**
 * Objets du stockage dont le manifeste C2PA a été relevé comme généré.
 * Vérifié le 30/10/2026 sur les cinq fichiers de Madère : `c2pa.created`
 * « Created by Google Generative AI », `digitalSourceType` =
 * `trainedAlgorithmicMedia`, filigrane SynthID. Aucune photo réelle de l'île
 * n'existe, donc aucun de ces objets n'est réutilisable.
 */
const OBJETS_GENERES = [
  'destinations/madere/ponta_do_sol.jpg',
  'destinations/madere/achadas_da_cruz.jpg',
  'destinations/madere/porto_moniz.jpg',
  'destinations/madere/pico_do_arieiro.jpg',
  'destinations/madere/fanal_foret.jpg',
];

/** Racines de code scannées pour une référence à un objet généré. */
const RACINES_CODE = ['app', 'components', 'lib', 'heldonica-mobile'];
const EXCLUS_CODE = new Set(['node_modules', '.next', '.git', 'build', 'dist']);
const EXTENSIONS_CODE = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md', '.mdx']);

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

/** Fichiers de code sous une racine, hors dossiers exclus. */
function fichiersCode(racine) {
  const sortie = [];
  let entrees;
  try {
    entrees = readdirSync(racine, { withFileTypes: true });
  } catch {
    return sortie;
  }
  for (const entree of entrees) {
    if (EXCLUS_CODE.has(entree.name)) continue;
    const chemin = join(racine, entree.name);
    if (entree.isDirectory()) sortie.push(...fichiersCode(chemin));
    else if (EXTENSIONS_CODE.has(entree.name.slice(entree.name.lastIndexOf('.')).toLowerCase())) {
      sortie.push(chemin);
    }
  }
  return sortie;
}

/** Références de code à un objet du stockage reconnu comme généré. */
export function referencesGenerees(racines = RACINES_CODE, objets = OBJETS_GENERES) {
  const trouvees = [];
  for (const chemin of racines.flatMap((r) => fichiersCode(r))) {
    let texte;
    try {
      texte = readFileSync(chemin, 'utf8');
    } catch {
      continue;
    }
    for (const objet of objets) {
      if (texte.includes(objet)) trouvees.push({ chemin, objet });
    }
  }
  return trouvees;
}

function main() {
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

  const references = referencesGenerees();

  if (fautives.length === 0 && references.length === 0) {
    console.log(`✓ Aucune image générée détectée dans ${RACINE}, ni référencée dans le code.`);
    process.exit(0);
  }

  if (fautives.length) {
    console.error(`✗ ${fautives.length} image(s) générée(s) par IA dans ${RACINE} :`);
    for (const { chemin, marqueurs } of fautives) {
      const ko = Math.round(statSync(chemin).size / 1024);
      console.error(`    ${relative(process.cwd(), chemin)} (${ko} Ko) — ${marqueurs.join(', ')}`);
    }
  }

  if (references.length) {
    console.error(`✗ ${references.length} référence(s) à une image générée du stockage :`);
    for (const { chemin, objet } of references) {
      console.error(`    ${relative(process.cwd(), chemin)} — ${objet}`);
    }
    console.error(`
Ces objets portent un manifeste C2PA de générateur (relevé le 30/10/2026) et ne
peuvent pas illustrer un voyage vécu. Le contrôle porte sur l'URL, pas sur les
octets : l'objet peut encore exister dans le bucket sans être publiable.`);
  }

  console.error(`
À faire (AGENTS.md, règle n°1) :
  - supprimer les fichiers du dépôt ;
  - remplacer leurs références (fallbacks, albums, templates) par une photo
    de terrain dont l'EXIF prouve la prise de vue ;
  - ne jamais réutiliser leur URL Supabase, même si l'objet y existe encore.
`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith('check-cms-ai-images.mjs')) {
  main();
}
