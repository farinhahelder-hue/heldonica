import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const HOOKS = path.resolve(__dirname, '../../.githooks');

function git(cwd: string, env: Record<string, string>, ...args: string[]) {
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t', ...env },
  });
}

let depot: string;
beforeAll(() => {
  depot = mkdtempSync(path.join(tmpdir(), 'hooks-'));
  git(depot, {}, 'init', '-q', '-b', 'main');
  git(depot, {}, 'config', 'core.hooksPath', HOOKS);
  writeFileSync(path.join(depot, 'a.txt'), 'a');
  git(depot, {}, 'add', 'a.txt');
  git(depot, {}, 'commit', '-q', '-m', 'init'); // sans AGENT_NAME : non contrôlé
});

function commitSur(branche: string, agent: string) {
  git(depot, {}, 'checkout', '-q', '-B', branche);
  writeFileSync(path.join(depot, 'b.txt'), `${branche}${agent}${Math.random()}`);
  git(depot, {}, 'add', 'b.txt');
  return git(depot, agent ? { AGENT_NAME: agent } : {}, 'commit', '-q', '-m', 'x');
}

describe('hook pre-commit', () => {
  it('laisse un agent commiter sur sa branche', () => {
    expect(commitSur('agent/claude/sujet', 'Claude').status).toBe(0);
    expect(commitSur('claude/ancien-prefixe', 'claude').status).toBe(0);
  });

  it("refuse de commiter sur la branche d'un autre agent", () => {
    const r = commitSur('agent/opencode/brand-look', 'claude');
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('opencode');
  });

  it('refuse un commit sur main pour un agent', () => {
    expect(commitSur('main', 'gemini').status).not.toBe(0);
  });

  it("ne contrôle pas quelqu'un qui ne s'annonce pas", () => {
    expect(commitSur('agent/opencode/autre', '').status).toBe(0);
  });
});

describe('hook pre-push', () => {
  const hook = path.join(HOOKS, 'pre-push');
  const lancer = (agent: string, ligne: string) =>
    spawnSync('sh', [hook], { input: ligne + '\n', encoding: 'utf8', env: { ...process.env, AGENT_NAME: agent } });

  it('accepte sa propre branche', () => {
    expect(lancer('claude', 'refs/heads/agent/claude/x abc refs/heads/agent/claude/x 0').status).toBe(0);
  });

  it("refuse la branche d'un autre, en cible comme en source", () => {
    expect(lancer('claude', 'refs/heads/agent/opencode/x abc refs/heads/agent/opencode/x 0').status).not.toBe(0);
    expect(lancer('claude', 'refs/heads/agent/opencode/x abc refs/heads/agent/claude/y 0').status).not.toBe(0);
  });

  it('refuse main, mais accepte un sha poussé vers sa branche', () => {
    expect(lancer('claude', 'refs/heads/agent/claude/x abc refs/heads/main 0').status).not.toBe(0);
    expect(lancer('claude', '9d7f32f abc refs/heads/claude/redaction 0').status).toBe(0);
  });

  it("ne bloque pas sans AGENT_NAME", () => {
    expect(lancer('', 'refs/heads/agent/opencode/x abc refs/heads/main 0').status).toBe(0);
  });
});
