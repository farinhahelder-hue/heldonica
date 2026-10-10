import { describe, it, expect } from 'vitest';
import {
  isArticleConvertedToBlocks,
  cleanLegacyWordPressHtml,
  migrateArticleContentToBlocks,
  batchMigrateArticles,
} from '@/lib/cms-article-migrator';
import { blocksToHtml } from '@/lib/cms-blocks-converter';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Article Migrator & Ingestion Idempotente (lib/cms-article-migrator.ts)', () => {
  const sampleBlocks: CmsBlock[] = [
    { id: 'h1', type: 'heading', level: 1, text: 'Traversée de Madère au pas lent' },
    { id: 'p1', type: 'text', content: 'Prendre le temps d\'observer la mer depuis les hauteurs.' },
  ];
  const convertedHtmlWithBlocks = blocksToHtml(sampleBlocks);

  describe('isArticleConvertedToBlocks', () => {
    it('retourne true si le HTML contient un commentaire de blocs valide', () => {
      expect(isArticleConvertedToBlocks(convertedHtmlWithBlocks)).toBe(true);
    });

    it('retourne false pour du HTML brut sans bloc', () => {
      expect(isArticleConvertedToBlocks('<h2>Titre classique</h2><p>Paragraphe standard.</p>')).toBe(false);
      expect(isArticleConvertedToBlocks(null)).toBe(false);
      expect(isArticleConvertedToBlocks('')).toBe(false);
    });

    it('retourne false si le commentaire est altéré ou non-JSON', () => {
      const corrupted = '<!-- heldonica:blocks [invalid json -->';
      expect(isArticleConvertedToBlocks(corrupted)).toBe(false);
    });
  });

  describe('cleanLegacyWordPressHtml', () => {
    it('supprime les balises et commentaires WordPress spécifiques', () => {
      const wpRaw = `
        <!-- wp:paragraph -->
        <p class="wp-image-1234 size-large">Premier paragraphe propre.</p>
        <!-- /wp:paragraph -->
        <p>&nbsp;</p>
      `;
      const cleaned = cleanLegacyWordPressHtml(wpRaw);

      expect(cleaned).not.toContain('<!-- wp:paragraph -->');
      expect(cleaned).not.toContain('class="wp-image-1234 size-large"');
      expect(cleaned).not.toContain('&nbsp;');
      expect(cleaned).toContain('Premier paragraphe propre.');
    });
  });

  describe('migrateArticleContentToBlocks', () => {
    it('est strictement idempotent et ne ré-écrit pas un article déjà migré', () => {
      const res = migrateArticleContentToBlocks(convertedHtmlWithBlocks, {
        title: 'Traversée de Madère',
      });

      expect(res.alreadyConverted).toBe(true);
      expect(res.changed).toBe(false);
      expect(res.finalBlockCount).toBe(2);
      expect(res.blocks[0].type).toBe('heading');
      expect(res.metrics.wordCount).toBeGreaterThan(0);
    });

    it('migre du pur HTML hérité en arborescence de blocs et injecte le conteneur lossless', () => {
      const legacyHtml = `
        <h2>Le phare de Ponta do Pargo</h2>
        <p>Un recoin paisible balayé par les vents de l'Atlantique.</p>
        <p>On s'est arrêtés là pour attendre le coucher du soleil.</p>
      `;

      const res = migrateArticleContentToBlocks(legacyHtml, {
        title: 'Ponta do Pargo',
        season: 'automne doré',
        mobility: 'marche',
      });

      expect(res.alreadyConverted).toBe(false);
      expect(res.changed).toBe(true);
      expect(res.finalBlockCount).toBeGreaterThanOrEqual(3);
      expect(res.migratedHtml).toContain('<!-- heldonica:blocks');
      expect(res.metrics.slowScore).toBeGreaterThanOrEqual(40);
      expect(res.a11y.isValid).toBe(true);
    });

    it('détecte et convertit les clichés avec marqueur de terrain en photo_evidence', () => {
      const htmlWithPinImage = `
        <h2>Cascade de Risco</h2>
        <figure>
          <img src="https://heldonica.fr/images/risco.jpg" alt="Risco" />
          <figcaption>📍 Madère — 2026-05-20 : Silence au pied de la cascade avant l'arrivée des marcheurs.</figcaption>
        </figure>
      `;

      const res = migrateArticleContentToBlocks(htmlWithPinImage, undefined, {
        detectPhotoEvidence: true,
      });

      const photoBlock = res.blocks.find((b) => b.type === 'photo_evidence');
      expect(photoBlock).toBeDefined();
      if (photoBlock && photoBlock.type === 'photo_evidence') {
        expect(photoBlock.location).toBe('Madère');
        expect(photoBlock.date).toBe('2026-05-20');
        expect(photoBlock.anecdote).toContain('Silence au pied de la cascade');
      }
    });
  });

  describe('batchMigrateArticles', () => {
    it('traite un lot hétérogène d\'articles avec comptages précis', () => {
      const articles = [
        {
          id: 1,
          slug: 'art-already-done',
          title: 'Article déjà migré',
          content: convertedHtmlWithBlocks,
        },
        {
          id: 2,
          slug: 'art-legacy-html',
          title: 'Article hérité',
          content: '<h2>Halte secrète</h2><p>Une ruelle dérobée de Podgorica.</p>',
        },
        {
          id: 3,
          slug: 'art-empty',
          title: 'Article vide',
          content: '',
        },
      ];

      const report = batchMigrateArticles(articles);

      expect(report.totalProcessed).toBe(3);
      expect(report.alreadyConvertedCount).toBe(1);
      expect(report.migratedCount).toBe(2);
      expect(report.errorCount).toBe(0);

      expect(report.results[0].status).toBe('already_converted');
      expect(report.results[1].status).toBe('migrated');
      expect(report.results[2].status).toBe('migrated');
    });
  });
});
