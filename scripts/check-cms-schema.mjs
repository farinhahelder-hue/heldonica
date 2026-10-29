/**
 * check-cms-schema — un type de bloc doit exister partout, ou nulle part.
 *
 * Le CMS a douze types de blocs disperses dans cinq fichiers : l'union
 * `BlockType`, la fabrique `createDefaultBlock`, le registre de schemas, le
 * convertisseur HTML et le rendu React. Rien ne verifiait qu'ils parlaient des
 * memes douze types. Un bloc ajoute a l'union sans rendu disparaissait
 * silencieusement de la page ; un bloc rendu sans schema arrivait en base sans
 * controle.
 *
 * Le controle lit les fichiers (pas d'import TypeScript : ce script tourne
 * avant `tsc`, sans dependances) et compare les cinq listes.
 *
 * Sortie : exit 1 si une liste diverge, avec le detail par type.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function lire(chemin) {
  try {
    return readFileSync(resolve(RACINE, chemin), 'utf8');
  } catch {
    console.error(`✗ fichier illisible : ${chemin}`);
    process.exit(2);
  }
}

function extraire(texte, motif) {
  const trouves = new Set();
  let m;
  const re = new RegExp(motif.source, motif.flags.includes('g') ? motif.flags : `${motif.flags}g`);
  while ((m = re.exec(texte)) !== null) trouves.add(m[1]);
  return trouves;
}

const types = lire('types/cms-blocks.ts');
const registre = lire('lib/cms-schema/index.ts');
const rendu = lire('components/blocks/BlockRenderer.tsx');
const convertisseur = lire('lib/cms-blocks-converter.ts');

// 1. L'union `BlockType` est la reference.
const blocUnion = types.match(/export type BlockType\s*=([\s\S]*?);/);
if (!blocUnion) {
  console.error('✗ impossible de lire l’union BlockType dans types/cms-blocks.ts');
  process.exit(2);
}
const reference = extraire(blocUnion[1], /'([a-z_]+)'/);

// 2. La fabrique de blocs par defaut.
const fabrique = types.slice(types.indexOf('export function createDefaultBlock'));
const defauts = extraire(fabrique, /case '([a-z_]+)':/);

// 3. Le registre de schemas.
const blocRegistre = registre.slice(registre.indexOf('export const BLOCK_SCHEMAS'));
const schemas = extraire(blocRegistre, /^\s{4}type: '([a-z_]+)',/m);

// 4. Le convertisseur HTML (blocksToHtml).
const blocConvertisseur = convertisseur.slice(
  convertisseur.indexOf('blocksToHtml'),
  convertisseur.indexOf('htmlToBlocks')
);
const convertis = extraire(blocConvertisseur, /case '([a-z_]+)':/);

// 5. Le rendu React. On se limite a `renderSingleBlock` : les helpers de
//    classe (`getSpacingClass`, `getThemeClass`) ont leurs propres `case` et
//    fausseraient la comparaison.
const blocRendu = rendu.slice(
  rendu.indexOf('const renderSingleBlock'),
  rendu.indexOf('return (', rendu.indexOf('const renderSingleBlock'))
);
const rendus = extraire(blocRendu, /case '([a-z_]+)':/);

const listes = [
  ['createDefaultBlock', defauts],
  ['registre lib/cms-schema', schemas],
  ['convertisseur HTML', convertis],
  ['BlockRenderer', rendus],
];

if (reference.size === 0) {
  console.error('✗ aucun type de bloc lu : le format de types/cms-blocks.ts a change');
  process.exit(2);
}

let echec = false;

for (const [nom, liste] of listes) {
  const manquants = [...reference].filter((type) => !liste.has(type));
  const inconnus = [...liste].filter((type) => !reference.has(type));

  if (manquants.length > 0) {
    echec = true;
    console.error(`✗ ${nom} : type(s) absent(s) — ${manquants.join(', ')}`);
  }
  if (inconnus.length > 0) {
    echec = true;
    console.error(`✗ ${nom} : type(s) hors de BlockType — ${inconnus.join(', ')}`);
  }
  if (manquants.length > 0 || inconnus.length > 0) {
    console.error(
      nom === 'registre lib/cms-schema'
        ? '  Ajouter le schema (champs obligatoires compris) ou retirer le type de BlockType.'
        : '  Un type de bloc doit avoir : schema, rendu, conversion HTML et bloc par defaut.'
    );
  }
}

if (echec) {
  console.error(`\n${reference.size} types de blocs attendus, listes lues : ${listes.map(([n, l]) => `${n} (${l.size})`).join(', ')}`);
  process.exit(1);
}

console.log(
  `✓ ${reference.size} types de blocs alignes : ${[...reference].join(', ')}`
);
