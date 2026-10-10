import { describe, it, expect, vi, beforeEach } from 'vitest';
import { suggestVaultSpotsForContent } from '../../lib/cms-vault-suggest';
import * as vaultSpotsModule from '../../lib/cms-vault-spots';
import type { CmsBlock } from '@/types/cms-blocks';

describe('cms-vault-suggest', () => {
  beforeEach(() => {
    vi.spyOn(vaultSpotsModule, 'getAllVaultSpots').mockReturnValue([
      {
        id: 'vault_1',
        numericId: 1,
        category: 'Test',
        title: 'Stoos Funicular',
        location: 'Stoos',
        tags: ['funicular', 'suisse'],
        livedExperience: 'Steepest in the world',
      },
      {
        id: 'vault_2',
        numericId: 2,
        category: 'Test',
        title: 'Stara Varoš Old Town',
        location: 'Stara Varoš',
        tags: ['montenegro', 'old town'],
        livedExperience: 'Narrow streets',
      },
      {
        id: 'vault_3',
        numericId: 3,
        category: 'Test',
        title: 'Podgorica Capital',
        location: 'Podgorica',
        tags: ['capital', 'montenegro'],
        livedExperience: 'Brutalist architecture',
      },
      {
        id: 'vault_4',
        numericId: 4,
        category: 'Test',
        title: 'Global Rules',
        location: 'Global Heldonica',
        tags: ['rules'],
        livedExperience: 'Do not use this',
      },
    ]);
  });

  it('suggests a spot based on location mention in text', () => {
    const text = "Le trajet jusqu'à Stoos est incroyable.";
    const suggestions = suggestVaultSpotsForContent(text, []);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].id).toBe('vault_1');
  });

  it('suggests a spot based on tag mention in text', () => {
    const text = "Un vieux funicular très pentu.";
    const suggestions = suggestVaultSpotsForContent(text, []);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].id).toBe('vault_1');
  });
  
  it('handles exact word boundaries (no false positives)', () => {
    const text = "A story about Stara Varoš.";
    const suggestions = suggestVaultSpotsForContent(text, []);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].id).toBe('vault_2');
    
    const text2 = "Bienvenue à Stoos!";
    const suggestions2 = suggestVaultSpotsForContent(text2, []);
    expect(suggestions2).toHaveLength(1);
    expect(suggestions2[0].id).toBe('vault_1');
    
    const text3 = "I like Stoosville."; 
    const suggestions3 = suggestVaultSpotsForContent(text3, []);
    expect(suggestions3).toHaveLength(0);
  });

  it('ignores spots that are already present in the blocks', () => {
    const text = "Le trajet jusqu'à Stoos est incroyable.";
    const existingBlocks: CmsBlock[] = [
      {
        id: 'b1',
        type: 'vault_spot',
        spotId: 'vault_1',
        title: 'Stoos',
        location: 'Stoos',
        livedExperience: '',
      }
    ];
    const suggestions = suggestVaultSpotsForContent(text, existingBlocks);
    expect(suggestions).toHaveLength(0);
  });

  it('ignores "Global Heldonica" locations', () => {
    const text = "Global Heldonica is everywhere.";
    const suggestions = suggestVaultSpotsForContent(text, []);
    expect(suggestions).toHaveLength(0);
  });
});
