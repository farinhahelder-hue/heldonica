/**
 * check-content-html-escapes — garde-fou anti-récidive contre les guillemets
 * échappés par un antislash dans une balise HTML, au sein des contenus CMS.
 *
 * Pourquoi ce script existe
 * -------------------------
 * `sql/seed_cms_zones_complete.sql:49` écrivait
 *   'Un art du voyage <span class=\"italic text-eucalyptus\">autrement</span>'
 * — réflexe JS/JSON — dans une chaîne SQL entre guillemets simples, où
 * l'antislash reste littéral. Le HTML servi portait donc `class=\"…\"`, que le
 * navigateur lit comme la classe `\"italic` plus un attribut parasite : la classe
 * Tailwind était perdue (« autrement » sans italique ni eucalyptus, sans erreur).
 *
 * Le correctif de rendu (`lib/html-attributes.ts`) rattrape l'affichage, et la
 * migration 20261024110000 nettoie la base. Ce contrôle empêche la récidive à la
 * source : un fichier de contenu ne doit plus jamais écrire un antislash devant
 * un guillemet à l'intérieur d'une balise.
 *
 * Périmètre : les fichiers SQL qui portent du contenu éditorial (`sql/*.sql`,
 * `supabase/migrations/*.sql`). Les scripts `scripts/generate-*-cms.mjs` sont
 * exclus à dessein : ils construisent du JSX, où `\\"` est un échappement
 * légitime.
 *
 * Ce qui est signalé : une balise (`<…>`) dont le contenu porte `\"` ou `\'`.
 * Ce qui ne l'est pas : un antislash en prose (notation mathématique, `\n`
 * littéral), ni un antislash dans du JSON hors balise.
 *
 * Usage : node scripts/check-content-html-escapes.mjs   (exit 1 si trouvé)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const SQL_CONTENT_DIRS = ['sql', 'supabase/migrations'];

// Balise portant un antislash devant un guillemet. `[^<>]*` borne la recherche à
// l'intérieur d'une balise : le motif ne franchit ni `<` ni `>`.
const BALISE_ECHAPPEE = /<[^<>]*\\["'][^<>]*>/g;

function fichiersSql(dir) {
  let entrees;
  try {
    entrees = readdirSync(dir);
  } catch {
    return [];
  }
  return entrees
    .filter((nom) => nom.endsWith('.sql'))
    .map((nom) => join(dir, nom))
    .filter((chemin) => statSync(chemin).isFile());
}

export function trouverGuillemetsEchappes(fichiers = SQL_CONTENT_DIRS.flatMap(fichiersSql)) {
  const trouves = [];
  for (const chemin of fichiers) {
    const lignes = readFileSync(chemin, 'utf8').split(/\r?\n/);
    lignes.forEach((ligne, i) => {
      // Un commentaire SQL (`-- …`) ne s'exécute pas : c'est le lieu normal pour
      // citer le défaut, il ne doit donc pas être signalé.
      if (ligne.trimStart().startsWith('--')) return;
      BALISE_ECHAPPEE.lastIndex = 0;
      const m = BALISE_ECHAPPEE.exec(ligne);
      if (m) trouves.push({ fichier: chemin, ligne: i + 1, extrait: m[0] });
    });
  }
  return trouves;
}

const trouves = trouverGuillemetsEchappes();

if (trouves.length) {
  console.error('\nGuillemets échappés par un antislash dans une balise HTML :\n');
  for (const t of trouves) {
    console.error(`  ${t.fichier}:${t.ligne}`);
    console.error(`      ${t.extrait}`);
  }
  console.error(
    '\nDans une chaîne SQL entre guillemets simples, `\\"` reste littéral et casse' +
      '\nl\'attribut au rendu. Écrire `"` seul : <span class="italic">.\n'
  );
  process.exit(1);
}

console.log(`Guillemets échappés dans une balise : aucun (${SQL_CONTENT_DIRS.join(', ')}).`);
