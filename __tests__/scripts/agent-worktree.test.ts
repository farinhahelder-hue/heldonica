import { describe, it, expect } from 'vitest';
// @ts-expect-error module .mjs sans déclaration
import { cibles } from '../../scripts/agent-worktree.mjs';

describe('agent-worktree', () => {
  it('construit la branche et le dossier', () => {
    const c = cibles('claude', 'mon-sujet', '/w/heldonica');
    expect(c.branche).toBe('agent/claude/mon-sujet');
    expect(c.dossier).toBe('/w/worktrees/claude-mon-sujet');
  });

  it('refuse les noms douteux', () => {
    expect(cibles('Claude', 'x', '/w/h')).toBeNull();
    expect(cibles('claude', '../evil', '/w/h')).toBeNull();
    expect(cibles('claude', '', '/w/h')).toBeNull();
    expect(cibles(undefined, 'x', '/w/h')).toBeNull();
  });
});
