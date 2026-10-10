import { describe, it, expect } from 'vitest';
import {
  getCmsTemplates,
  instantiateCmsTemplate,
  validateTemplateBlocks,
  CMS_TEMPLATES,
  CmsTemplateId,
} from '@/lib/cms-templates';

describe('CMS Templates Library (lib/cms-templates.ts)', () => {
  it('fournit la liste exhaustive des 4 gabarits éditoriaux', () => {
    const templates = getCmsTemplates();
    expect(templates).toHaveLength(4);
    const ids = templates.map((t) => t.id);
    expect(ids).toContain('slow_travel_diary');
    expect(ids).toContain('step_by_step_guide');
    expect(ids).toContain('hospitality_spotlight');
    expect(ids).toContain('photo_essay');
  });

  it('instancie un gabarit slow_travel_diary avec des IDs uniques et personnalisation de destination', () => {
    const blocks = instantiateCmsTemplate('slow_travel_diary', { destination: 'la Vallée du Douro' });
    expect(blocks.length).toBeGreaterThanOrEqual(5);

    // Vérifie la personnalisation
    const h1 = blocks.find((b) => b.type === 'heading' && b.level === 1) as any;
    expect(h1).toBeDefined();
    expect(h1.text).toContain('la Vallée du Douro');

    // Vérifie l'unicité stricte des IDs
    const ids = blocks.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('instancie un gabarit step_by_step_guide incluant un bloc vault_spot', () => {
    const blocks = instantiateCmsTemplate('step_by_step_guide', { destination: 'les Pouilles' });
    const vaultBlock = blocks.find((b) => b.type === 'vault_spot');
    expect(vaultBlock).toBeDefined();
    expect((vaultBlock as any).title).toBeTruthy();
    expect((vaultBlock as any).livedExperience).toBeTruthy();
  });

  it('instancie un gabarit hospitality_spotlight avec galerie et bouton d\'action', () => {
    const blocks = instantiateCmsTemplate('hospitality_spotlight');
    const galleryBlock = blocks.find((b) => b.type === 'gallery') as any;
    const buttonBlock = blocks.find((b) => b.type === 'button') as any;

    expect(galleryBlock).toBeDefined();
    expect(galleryBlock.images.length).toBeGreaterThan(0);
    expect(buttonBlock).toBeDefined();
    expect(buttonBlock.url).toBe('/expert-hotelier');
  });

  it('instancie un gabarit photo_essay avec des blocs de preuve photo de terrain', () => {
    const blocks = instantiateCmsTemplate('photo_essay', { destination: 'les Crêtes de Stoos' });
    const photoBlocks = blocks.filter((b) => b.type === 'photo_evidence') as any[];
    expect(photoBlocks.length).toBeGreaterThanOrEqual(2);
    expect(photoBlocks[0].imageUrl).toMatch(/^https:\/\//);
    expect(photoBlocks[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('valide que tous les gabarits officiels respectent la charte éditoriale (0 mot banni)', () => {
    const templateIds = Object.keys(CMS_TEMPLATES) as CmsTemplateId[];

    for (const tplId of templateIds) {
      const blocks = instantiateCmsTemplate(tplId);
      const validation = validateTemplateBlocks(blocks);
      expect(validation.valid, `Le gabarit ${tplId} a échoué: ${validation.issues.join(', ')}`).toBe(true);
      expect(validation.issues).toHaveLength(0);
    }
  });

  it('détecte et rejette un bloc contenant un mot interdit', () => {
    const blocks = instantiateCmsTemplate('slow_travel_diary');
    // Injection malveillante d'un mot banni
    (blocks[0] as any).text = 'Voici un lieu incontournable et paradisiaque à visiter absolument';

    const validation = validateTemplateBlocks(blocks);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((msg) => msg.includes('incontournable') || msg.includes('paradisiaque'))).toBe(true);
  });

  it('détecte un doublon d\'identifiants de blocs', () => {
    const blocks = instantiateCmsTemplate('slow_travel_diary');
    blocks[1].id = blocks[0].id; // Forcer le doublon

    const validation = validateTemplateBlocks(blocks);
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((msg) => msg.includes('doublon'))).toBe(true);
  });
});
