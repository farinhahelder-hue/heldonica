import { describe, it, expect } from 'vitest';
import {
  extractTextFromBlock,
  lintBlock,
  lintCanvasBlocks,
  BRAND_REPLACEMENTS,
} from '@/lib/cms-brand-linter';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Brand Voice Linter (lib/cms-brand-linter.ts)', () => {
  it('extrait correctement le texte des différents types de blocs', () => {
    const headingBlock: CmsBlock = {
      id: 'h1',
      type: 'heading',
      text: 'Sur la crête de Stoos',
      level: 2,
    };
    expect(extractTextFromBlock(headingBlock)).toBe('Sur la crête de Stoos');

    const photoEvidenceBlock: CmsBlock = {
      id: 'p1',
      type: 'photo_evidence',
      photoUrl: 'https://heldonica.fr/stoos.jpg',
      location: 'Fronalpstock',
      date: '2025-06-15',
      anecdote: 'Le brouillard s\'est levé d\'un coup.',
    };
    expect(extractTextFromBlock(photoEvidenceBlock)).toContain('Fronalpstock');
    expect(extractTextFromBlock(photoEvidenceBlock)).toContain('brouillard');
  });

  it('détecte les mots bannis et propose des alternatives slow travel', () => {
    const dirtyBlock: CmsBlock = {
      id: 't1',
      type: 'text',
      content: 'Voici un super bon plan pour vos prochaines vacances, un spot incontournable et magnifique !',
    };

    const res = lintBlock(dirtyBlock);
    expect(res.isValid).toBe(false);
    expect(res.forbiddenWords).toContain('bon plan');
    expect(res.forbiddenWords).toContain('incontournable');
    expect(res.forbiddenWords).toContain('magnifique');
    expect(res.forbiddenWords).toContain('spot');

    const bonPlanIssue = res.issues.find((i) => i.word === 'bon plan');
    expect(bonPlanIssue?.suggestion).toBe(BRAND_REPLACEMENTS['bon plan']);
  });

  it('valide un bloc conforme sans avertissements', () => {
    const cleanBlock: CmsBlock = {
      id: 't2',
      type: 'text',
      content: 'On a marché le long de la crête au petit matin. L\'air sentait le sapin et la roche humide.',
    };

    const res = lintBlock(cleanBlock);
    expect(res.isValid).toBe(true);
    expect(res.issues).toHaveLength(0);
    expect(res.forbiddenWords).toHaveLength(0);
  });

  it('alerte sur les pronoms prohibés (je, nous, les voyageurs)', () => {
    const jeBlock: CmsBlock = {
      id: 't3',
      type: 'text',
      content: 'Je pense que les voyageurs vont adorer ce sentier.',
    };

    const res = lintBlock(jeBlock);
    expect(res.isValid).toBe(false);
    expect(res.issues.some((i) => i.type === 'pronoun' && i.message.includes('"je"'))).toBe(true);
    expect(res.issues.some((i) => i.type === 'pronoun' && i.message.includes('Les voyageurs'))).toBe(true);
  });

  it('calcule un résumé global de canvas avec lintCanvasBlocks', () => {
    const blocks: CmsBlock[] = [
      {
        id: 'b1',
        type: 'heading',
        text: 'Notre carnet de route',
        level: 1,
      },
      {
        id: 'b2',
        type: 'text',
        content: 'On a adoré cette visite avec nos 35 € de budget et 4 heures de marche.',
      },
      {
        id: 'b3',
        type: 'text',
        content: 'Un vrai bon plan à ne pas manquer !',
      },
    ];

    const summary = lintCanvasBlocks(blocks);
    expect(summary.totalForbidden).toBeGreaterThan(0);
    expect(summary.uniqueForbidden).toContain('bon plan');
    expect(summary.blockResults['b3'].isValid).toBe(false);
    expect(summary.blockResults['b2'].isValid).toBe(true);
  });
});
