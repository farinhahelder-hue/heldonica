/**
 * agent-worktree — un dossier de travail à soi, pour ne pas gâcher celui des autres.
 *
 * Les agents partageaient un seul dossier, donc une seule branche active : le
 * `git checkout` de l'un déplaçait tous les autres. Un worktree donne à chacun
 * son dossier et sa branche, sur le même dépôt.
 *
 * Usage :
 *   npm run worktree -- <agent> <slug>
 *   npm run worktree -- claude mon-sujet
 *   → ../worktrees/claude-mon-sujet, branche agent/claude/mon-sujet (depuis origin/main)
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const NOM = /^[a-z0-9][a-z0-9-]{0,40}$/;

/** Dossier et branche d'un agent, ou null si un nom est invalide. */
export function cibles(agent, slug, racine) {
  if (!NOM.test(agent ?? '') || !NOM.test(slug ?? '')) return null;
  return {
    branche: `agent/${agent}/${slug}`,
    dossier: path.resolve(racine, '..', 'worktrees', `${agent}-${slug}`),
  };
}

function git(...args) {
  return spawnSync('git', args, { encoding: 'utf8' });
}

function main() {
  const [agent, slug] = process.argv.slice(2);
  const racine = git('rev-parse', '--show-toplevel').stdout.trim();
  const c = cibles(agent?.toLowerCase(), slug?.toLowerCase(), racine);
  if (!c) {
    console.error('Usage : npm run worktree -- <agent> <slug>   (minuscules, chiffres et tirets)');
    process.exit(2);
  }
  if (existsSync(c.dossier)) {
    console.error(`✗ ${c.dossier} existe déjà : travaille-y, ou choisis un autre slug.`);
    process.exit(1);
  }

  git('fetch', '--quiet', 'origin', 'main');
  const r = git('worktree', 'add', '-b', c.branche, c.dossier, 'origin/main');
  if (r.status !== 0) {
    console.error(r.stderr.trim());
    process.exit(1);
  }

  console.log(`✓ ${c.branche}\n  ${c.dossier}\n`);
  console.log(`  cd "${c.dossier}"`);
  console.log(`  export AGENT_NAME=${agent}   # active les hooks de protection`);
  console.log('  node_modules n\'est pas partagé : un seul `npm ci` à la fois (AGENTS.md).');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main();
}
