import { describe, it, expect } from 'vitest';
import { computeBlockDiff, getBlockSummary } from '@/lib/cms-revisions-diff';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Revisions Block Diff Engine (__tests__/lib/cms-revisions-diff.test.ts)', () => {
  it('détecte correctement des blocs strictement identiques (unchanged)', () => {
    const blocks: CmsBlock[] = [
      { id: 'h1', type: 'heading', level: 1, text: 'Route des vins de Roumanie' },
      { id: 'txt1', type: 'text', content: 'Paragraphe d’introduction authentique.' },
    ];

    const diff = computeBlockDiff(blocks, blocks);
    expect(diff.totalEntries).toBe(2);
    expect(diff.unchangedCount).toBe(2);
    expect(diff.addedCount).toBe(0);
    expect(diff.removedCount).toBe(0);
    expect(diff.modifiedCount).toBe(0);
  });

  it('détecte les blocs modifiés lorsque le texte ou le niveau change', () => {
    const current: CmsBlock[] = [
      { id: 'h1', type: 'heading', level: 1, text: 'Version actuelle modifiée' },
    ];
    const revision: CmsBlock[] = [
      { id: 'h1', type: 'heading', level: 1, text: 'Version archivée originale' },
    ];

    const diff = computeBlockDiff(current, revision);
    expect(diff.totalEntries).toBe(1);
    expect(diff.modifiedCount).toBe(1);
    expect(diff.entries[0].diffType).toBe('modified');
    expect(diff.entries[0].details?.before).toContain('Version actuelle modifiée');
    expect(diff.entries[0].details?.after).toContain('Version archivée originale');
  });

  it('détecte les blocs ajoutés et retirés lors d’un rollback', () => {
    const current: CmsBlock[] = [
      { id: 'b_current_only', type: 'text', content: 'Nouveau paragraphe rédigé récemment' },
    ];
    const revision: CmsBlock[] = [
      { id: 'b_rev_only', type: 'image', url: 'https://www.heldonica.fr/old.jpg', alt: 'Ancienne photo', layout: 'wide' },
    ];

    const diff = computeBlockDiff(current, revision);
    expect(diff.addedCount).toBe(1); // Présent dans la révision (reviendra)
    expect(diff.removedCount).toBe(1); // Présent seulement dans l'actuel (disparaîtra)
    expect(diff.totalEntries).toBe(2);

    const addedEntry = diff.entries.find((e) => e.diffType === 'added');
    const removedEntry = diff.entries.find((e) => e.diffType === 'removed');

    expect(addedEntry?.id).toBe('b_rev_only');
    expect(removedEntry?.id).toBe('b_current_only');
  });

  it('génère un résumé lisible pour chaque type de bloc', () => {
    const headingBlock: CmsBlock = { id: 'h', type: 'heading', level: 2, text: 'Sous-titre' };
    const photoBlock: CmsBlock = {
      id: 'pe',
      type: 'photo_evidence',
      imageUrl: 'https://www.heldonica.fr/pic.jpg',
      location: 'Podgorica',
      date: '2026-05-27',
      anecdote: 'Pause café sur les ponts ottomans.',
    };

    expect(getBlockSummary(headingBlock).title).toBe('Titre H2');
    expect(getBlockSummary(headingBlock).summary).toBe('Sous-titre');

    expect(getBlockSummary(photoBlock).title).toBe('Preuve de terrain 📍');
    expect(getBlockSummary(photoBlock).summary).toContain('Podgorica');
  });
});
