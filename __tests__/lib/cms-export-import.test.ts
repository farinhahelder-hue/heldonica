import { describe, it, expect } from 'vitest';
import {
  exportArticleToMarkdown,
  exportArticleToJson,
  exportArticleToHtml,
  importArticleFromMarkdown,
  importArticleFromJson,
  blocksToMarkdown,
  type ExportArticleInput,
} from '@/lib/cms-export-import';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Export & Import Module', () => {
  const sampleBlocks: CmsBlock[] = [
    { id: 'blk_1', type: 'heading', level: 2, text: 'Sentier des Bergers' },
    { id: 'blk_2', type: 'text', content: 'Marche lente à travers la vallée brumeuse.' },
    {
      id: 'blk_3',
      type: 'photo_evidence',
      imageUrl: 'https://cdn.heldonica.fr/bergers.jpg',
      location: 'Parc National du Durmitor',
      date: '2026-06-12',
      anecdote: 'Le son des clarines dans la combe isolée.',
    },
  ];

  const sampleArticle: ExportArticleInput = {
    id: 99,
    title: 'Échappée au Durmitor',
    slug: 'echappee-durmitor',
    excerpt: 'Trois jours de marche lente dans le Monténégro sauvage.',
    status: 'published',
    category: 'Monténégro',
    tags: ['durmitor', 'slow-travel', 'randonnee'],
    season: 'Été doux',
    mobility: 'Train & marche',
    budget_level: 'Hôtes locaux',
  };

  it('exporte un article en Markdown avec frontmatter et sérialisation lossless', () => {
    const md = exportArticleToMarkdown(sampleArticle, sampleBlocks);

    expect(md).toContain('title: Échappée au Durmitor');
    expect(md).toContain('slug: echappee-durmitor');
    expect(md).toContain('season: Été doux');
    expect(md).toContain('## Sentier des Bergers');
    expect(md).toContain('<!-- heldonica:blocks');
    expect(md).toContain('Parc National du Durmitor');
  });

  it('exporte un article en JSON conforme au schéma Heldonica', () => {
    const jsonStr = exportArticleToJson(sampleArticle, sampleBlocks);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.schema).toBe('heldonica_cms_article_v1');
    expect(parsed.article.title).toBe('Échappée au Durmitor');
    expect(parsed.article.slug).toBe('echappee-durmitor');
    expect(parsed.blocks).toHaveLength(3);
    expect(parsed.metrics.word_count).toBeGreaterThan(10);
    expect(parsed.metrics.slow_score).toBeGreaterThan(0);
  });

  it('exporte un document HTML autonome valide', () => {
    const html = exportArticleToHtml(sampleArticle, sampleBlocks);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Échappée au Durmitor</title>');
    expect(html).toContain('<h2>Sentier des Bergers</h2>');
    expect(html).toContain('Parc National du Durmitor');
  });

  it('effectue un round-trip 100% lossless Markdown -> Import', () => {
    const exportedMd = exportArticleToMarkdown(sampleArticle, sampleBlocks);
    const importRes = importArticleFromMarkdown(exportedMd);

    expect(importRes.success).toBe(true);
    expect(importRes.article).toBeDefined();
    if (importRes.article) {
      expect(importRes.article.title).toBe('Échappée au Durmitor');
      expect(importRes.article.slug).toBe('echappee-durmitor');
      expect(importRes.article.season).toBe('Été doux');
      expect(importRes.article.mobility).toBe('Train & marche');
      expect(importRes.article.blocks).toHaveLength(3);
      expect(importRes.article.blocks[0].type).toBe('heading');
      expect(importRes.article.blocks[2].type).toBe('photo_evidence');
    }
  });

  it('importe du Markdown pur sans commentaire en générant des blocs structurés', () => {
    const rawObsidianMd = `---
title: Notes de voyage en Sicile
slug: sicile-notes
category: Italie
---
# L'aube sur les Salines

Un silence absolu enveloppe les bassins roses au petit matin.

## Halte à Mozia

La traversée en barque traditionnelle vers l'île phénicienne.
`;

    const importRes = importArticleFromMarkdown(rawObsidianMd);

    expect(importRes.success).toBe(true);
    expect(importRes.article).toBeDefined();
    if (importRes.article) {
      expect(importRes.article.title).toBe('Notes de voyage en Sicile');
      expect(importRes.article.slug).toBe('sicile-notes');
      expect(importRes.article.blocks.length).toBeGreaterThanOrEqual(4);
      expect(importRes.article.blocks.some((b) => b.type === 'heading')).toBe(true);
      expect(importRes.article.blocks.some((b) => b.type === 'text')).toBe(true);
    }
  });

  it('importe fidèlement un fichier JSON exporté', () => {
    const jsonStr = exportArticleToJson(sampleArticle, sampleBlocks);
    const importRes = importArticleFromJson(jsonStr);

    expect(importRes.success).toBe(true);
    expect(importRes.article).toBeDefined();
    if (importRes.article) {
      expect(importRes.article.title).toBe('Échappée au Durmitor');
      expect(importRes.article.slug).toBe('echappee-durmitor');
      expect(importRes.article.blocks).toHaveLength(3);
    }
  });

  it('gère proprement les erreurs de parsing sur contenus invalides', () => {
    const emptyMdRes = importArticleFromMarkdown('');
    expect(emptyMdRes.success).toBe(false);
    expect(emptyMdRes.errors?.[0]).toContain('vide');

    const invalidJsonRes = importArticleFromJson('{ malformed json');
    expect(invalidJsonRes.success).toBe(false);
    expect(invalidJsonRes.errors?.[0]).toContain('Format JSON invalide');
  });
});
