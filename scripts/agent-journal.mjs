#!/usr/bin/env node
/**
 * agent-journal — ecrire et relire le journal des actions d'agents.
 *
 *   node scripts/agent-journal.mjs log --kind=git --verb=commit --target=agent/x/y \
 *        --outcome=ok --message="sujet" --commit=<sha> --task=<uuid>
 *   node scripts/agent-journal.mjs tail --limit=20 [--json]
 *   node scripts/agent-journal.mjs --selftest
 *
 * `log` ne bloque jamais : il rend 0 meme si la base est injoignable ou si la
 * migration n'est pas appliquee (message sur stderr, jamais de valeur de
 * secret). `--selftest` verifie la redaction et rend 1 si elle fuit — la CI
 * s'en sert pour prouver que le garde-fou mord.
 */

import {
  chargerEnv,
  journaliser,
  lireActions,
  redact,
  selftest,
} from './lib/agent-journal-core.mjs';

function arguments_() {
  const sortie = { _: [] };
  for (const brut of process.argv.slice(2)) {
    if (!brut.startsWith('--')) {
      sortie._.push(brut);
      continue;
    }
    const [nom, ...reste] = brut.slice(2).split('=');
    sortie[nom] = reste.length > 0 ? reste.join('=') : true;
  }
  return sortie;
}

const args = arguments_();
chargerEnv();

if (args.selftest) {
  const echecs = selftest();
  if (echecs.length > 0) {
    for (const echec of echecs) console.error(`✗ ${echec}`);
    process.exit(1);
  }
  console.log('✓ redaction : secrets masques, chaines banales intactes');
  process.exit(0);
}

const commande = args._[0];

if (commande === 'tail') {
  const limite = Math.max(1, Math.min(200, parseInt(args.limit || '20', 10) || 20));
  try {
    const lignes = await lireActions(limite);
    if (args.json) {
      console.log(JSON.stringify(lignes, null, 2));
    } else if (lignes.length === 0) {
      console.log('journal vide (aucune action ecrite)');
    } else {
      for (const l of lignes) {
        const quand = String(l.created_at || '').slice(0, 16).replace('T', ' ');
        const cible = l.target ? ` ${l.target}` : '';
        console.log(
          `${quand}  ${l.agent.padEnd(10)} ${l.kind}/${l.verb}${cible}  ${l.outcome}  ${l.commit_sha ? l.commit_sha.slice(0, 8) : ''}`
        );
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(2);
  }
}

if (commande === 'log') {
  const detail = {};
  if (args.message) detail.sujet = args.message;
  if (args.files) detail.fichiers = String(args.files).split(',').slice(0, 50);
  if (args.reason) detail.raison = args.reason;

  const ecrit = await journaliser({
    task_id: typeof args.task === 'string' ? args.task : undefined,
    kind: args.kind || 'tool',
    verb: args.verb || 'action',
    target: typeof args.target === 'string' ? args.target : undefined,
    outcome: args.outcome || 'ok',
    commit_sha: typeof args.commit === 'string' ? args.commit : undefined,
    branch: typeof args.branch === 'string' ? args.branch : undefined,
    duration_ms: args.duration ? Number(args.duration) : undefined,
    detail,
  });

  if (!args.quiet) {
    console.log(
      ecrit
        ? `✓ action journalisee (${redact(args.kind || 'tool')}/${redact(args.verb || 'action')})`
        : '– action non journalisee (base ou migration indisponible)'
    );
  }
  // Un journal indisponible ne fait jamais echouer le geste qu'il decrit.
  process.exit(0);
}

console.error('Usage : agent-journal.mjs log|tail […] | --selftest');
process.exit(2);
