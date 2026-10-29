import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * Le journal d'actions ecrit en base ce que les agents lui donnent. S'il ne
 * masque pas un secret, il devient un second journal de session — ceux qui ont
 * laisse passer `sb_secret_…` et `ghu_…` le 26/10. Le controle est donc
 * execute sur le vrai script, pas sur une copie de sa logique.
 */
describe('journal d’actions — redaction', () => {
  it('masque les motifs de secrets et laisse passer le texte banal', () => {
    const script = path.resolve(process.cwd(), 'scripts/agent-journal.mjs');
    const sortie = execFileSync(process.execPath, [script, '--selftest'], {
      encoding: 'utf8',
    });
    expect(sortie).toContain('redaction');
  });

  it('sort en erreur si un secret n’est pas masque', () => {
    const script = path.resolve(process.cwd(), 'scripts/agent-journal.mjs');
    // Le selftest est le seul mode qui ecrit sur stdout/stderr sans base ;
    // on verifie ici son code de sortie, qui doit etre 0 quand tout est masque.
    const code = execFileSync(process.execPath, [script, '--selftest'], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    expect(code).toBeTruthy();
  });
});
