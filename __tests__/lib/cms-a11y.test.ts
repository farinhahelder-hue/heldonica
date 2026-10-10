import { describe, it, expect } from 'vitest';
import { auditCanvasA11y } from '@/lib/cms-a11y';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Accessibility Audit (lib/cms-a11y.ts)', () => {
  it('valide un ensemble de blocs parfaitement accessibles avec un score de 100', () => {
    const cleanBlocks: CmsBlock[] = [
      {
        id: 'h1',
        type: 'heading',
        level: 1,
        text: 'Carnet de route dans les Alpes suisses',
      },
      {
        id: 'h2',
        type: 'heading',
        level: 2,
        text: 'La traversée de Stoos',
      },
      {
        id: 'img1',
        type: 'image',
        url: 'https://heldonica.fr/stoos.jpg',
        alt: 'Vue panoramique sur le lac des Quatre-Cantons depuis la crête de Fronalpstock',
        layout: 'wide',
      },
      {
        id: 'btn1',
        type: 'button',
        label: 'Consulter notre carnet complet',
        url: 'https://heldonica.fr/destinations/suisse',
        variant: 'primary_gold',
      },
    ];

    const report = auditCanvasA11y(cleanBlocks);
    expect(report.score).toBe(100);
    expect(report.isValid).toBe(true);
    expect(report.errorsCount).toBe(0);
    expect(report.issues).toHaveLength(0);
  });

  it('détecte les images sans texte alternatif et pénalise le score', () => {
    const dirtyBlocks: CmsBlock[] = [
      {
        id: 'img_no_alt',
        type: 'image',
        url: 'https://heldonica.fr/photo.jpg',
        alt: '',
        layout: 'wide',
      },
    ];

    const report = auditCanvasA11y(dirtyBlocks);
    expect(report.isValid).toBe(false);
    expect(report.errorsCount).toBe(1);
    expect(report.score).toBeLessThan(100);
    expect(report.issues.some((i) => i.type === 'missing_alt' && i.severity === 'error')).toBe(true);
  });

  it('avertit en cas de saut abrupt dans la hiérarchie des titres (H1 -> H3)', () => {
    const jumpBlocks: CmsBlock[] = [
      {
        id: 'h1',
        type: 'heading',
        level: 1,
        text: 'Grand Titre',
      },
      {
        id: 'h3',
        type: 'heading',
        level: 3,
        text: 'Sous-titre avec niveau sauté',
      },
    ];

    const report = auditCanvasA11y(jumpBlocks);
    expect(report.warningsCount).toBe(1);
    expect(report.issues.some((i) => i.type === 'heading_hierarchy')).toBe(true);
    expect(report.issues[0].suggestion).toContain('H2');
  });

  it('détecte les boutons sans label ou avec lien non renseigné', () => {
    const btnBlocks: CmsBlock[] = [
      {
        id: 'b_empty',
        type: 'button',
        label: '',
        url: '#',
        variant: 'outline',
      },
    ];

    const report = auditCanvasA11y(btnBlocks);
    expect(report.issues.some((i) => i.type === 'empty_button')).toBe(true);
    expect(report.issues.some((i) => i.type === 'invalid_url')).toBe(true);
  });
});
