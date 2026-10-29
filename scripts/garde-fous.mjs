/**
 * garde-fous — exécute la suite de contrôles et récapitule dans un tableau.
 *
 * `package.json` référence ce script depuis des mois (`npm run preflight`,
 * `npm run garde-fous`) et AGENTS.md en fait le geste obligatoire avant de
 * toucher au code — mais le fichier n'avait jamais été committé : les deux
 * commandes échouaient en MODULE_NOT_FOUND, et personne ne lançait donc le
 * pré-vol. C'est la même cause que le reste de l'incident du 10/10 : un
 * contrôle documenté que rien n'exécutait.
 *
 * Deux modes :
 *   node scripts/garde-fous.mjs              # suite complète (CI-like)
 *   node scripts/garde-fous.mjs --preflight  # contrôles rapides, sans base ni compilation
 *
 * Les contrôles qui interrogent Supabase sortent en 2 quand les identifiants
 * manquent : ils sont alors rapportés « ignoré », jamais « réussi » — un
 * contrôle sauté n'est pas un contrôle vert.
 *
 * Sortie : exit 1 si au moins un contrôle échoue. Un « ignoré » ne fait pas
 * échouer le run, mais il est visible dans le tableau.
 */

import { spawnSync } from 'node:child_process';

export const CHECKS = [
  { key: 'workspace', label: "Synchronisation de l'espace de travail", script: 'check:workspace', preflight: true },
  { key: 'brand-sync', label: 'Parité voix de marque (TS ↔ Python)', script: 'check:brand-sync', preflight: true },
  { key: 'ai-models', label: "Fraîcheur des modèles d'IA", script: 'check:ai-models', preflight: true },
  { key: 'api-auth', label: 'Sécurité des routes API', script: 'check:api-auth', preflight: true },
  { key: 'erreurs-avalees', label: 'Erreurs Supabase avalées', script: 'check:erreurs-avalees', preflight: true },
  { key: 'cms-migrations', label: 'Tables référencées ↔ migrations', script: 'check:cms-migrations', preflight: true },
  { key: 'cms-cache', label: 'Fenêtre de revalidation des pages CMS', script: 'check:cms-cache', preflight: true },
  { key: 'cms-schema', label: 'Types de blocs ↔ schémas ↔ rendu', script: 'check:cms-schema', preflight: true },
  { key: 'cms-zones', label: 'Zones CMS orphelines', script: 'check:cms-zones', preflight: false, needsDb: true },
  { key: 'cms-drift', label: 'Dérive des tables (base réelle)', script: 'check:cms-drift', preflight: false, needsDb: true },
  { key: 'content-coherence', label: 'Cohérence éditoriale', script: 'check:content-coherence', preflight: false, needsDb: true },
  { key: 'content-pages', label: 'Prose des pages (mots bannis, brouillons)', script: 'check:content-pages', preflight: true },
  { key: 'content-known-errors', label: 'Fautes connues dans le code (replis JSX)', script: 'check:content-known-errors', preflight: true },
  { key: 'image-paths', label: "Chemins d'image locaux (fichiers dans public/)", script: 'check:image-paths', preflight: true },
  { key: 'design-tics', label: 'Tics visuels IA / SaaS (pages publiques)', script: 'check:design-tics', preflight: true },
  { key: 'cms-emojis', label: 'Emojis décoratifs en base (zones CMS)', script: 'check:cms-emojis', preflight: false, needsDb: true },
  { key: 'content-html-escapes', label: 'Guillemets échappés dans les balises (SQL)', script: 'check:content-html-escapes', preflight: true },
  { key: 'cms-hardcode', label: 'Texte en dur hors CMS (cliquet)', script: 'check:cms-hardcode', preflight: true },
  { key: 'apk-signature', label: 'Signature APK (pas de clé de debug publique)', script: 'check:apk-signature', preflight: true },
  { key: 'content-evidence', label: 'Vécu adossé aux photos', script: 'check:content-evidence', preflight: false },
  { key: 'typecheck', label: 'TypeScript (tsc)', cmd: ['npx', 'tsc', '--noEmit'], preflight: false },
  { key: 'tests', label: 'Tests (vitest)', cmd: ['npx', 'vitest', 'run'], preflight: false },
];

const ICONE = { ok: '✓', echec: '✗', ignore: '–' };

function executer(check) {
  const [bin, args] = check.cmd
    ? [check.cmd[0], check.cmd.slice(1)]
    : ['npm', ['run', '--silent', check.script]];
  const r = spawnSync(bin, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  return r.status ?? 1;
}

function main() {
  const preflight = process.argv.includes('--preflight');
  const checks = CHECKS.filter((c) => !preflight || c.preflight);

  console.log(
    preflight
      ? `\nPré-vol Heldonica — ${checks.length} contrôle(s) rapide(s)\n`
      : `\nGarde-fous Heldonica — ${checks.length} contrôle(s)\n`
  );

  const resultats = [];
  for (const check of checks) {
    const code = executer(check);
    // 2 = le script signale explicitement qu'il ne peut pas conclure (identifiants
    // Supabase absents). « Ignoré » n'est pas « réussi ».
    const statut = code === 0 ? 'ok' : code === 2 ? 'ignore' : 'echec';
    resultats.push({ check, statut, code });
    console.log(`  ${ICONE[statut]} ${check.label}`);
  }

  const largeur = Math.max(...resultats.map((r) => r.check.label.length), 20);
  console.log('\n' + '-'.repeat(largeur + 12));
  console.log(`${'CONTROLE'.padEnd(largeur)} | RESULTAT`);
  console.log('-'.repeat(largeur + 12));
  for (const { check, statut } of resultats) {
    const mot = statut === 'ok' ? 'réussi' : statut === 'ignore' ? 'ignoré' : 'ÉCHEC';
    console.log(`${check.label.padEnd(largeur)} | ${mot}`);
  }
  console.log('-'.repeat(largeur + 12));

  const echecs = resultats.filter((r) => r.statut === 'echec');
  const ignores = resultats.filter((r) => r.statut === 'ignore');

  if (ignores.length) {
    console.log(
      `\n${ignores.length} contrôle(s) ignoré(s) faute d'identifiants Supabase — ` +
      "non exécuté(s), donc non vérifié(s)."
    );
  }

  if (echecs.length) {
    console.log(`\n✗ ${echecs.length} contrôle(s) en échec : ${echecs.map((r) => r.check.label).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n✓ ${resultats.length - ignores.length}/${resultats.length} contrôle(s) réussi(s).`);
  process.exit(0);
}

// Exécuté seulement en ligne de commande : les tests importent CHECKS.
if (process.argv[1] && process.argv[1].endsWith('garde-fous.mjs')) main();
