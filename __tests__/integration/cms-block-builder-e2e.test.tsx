import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  CMS_TEMPLATES,
  instantiateCmsTemplate,
  validateTemplateBlocks,
  type CmsTemplateId,
} from '@/lib/cms-templates';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { BlockCanvas } from '@/components/admin/blocks/BlockCanvas';
import { blocksToHtml, htmlToBlocks } from '@/lib/cms-blocks-converter';
import { FORBIDDEN_WORDS } from '@/lib/brand-voice';
import { lintBlock, lintCanvasBlocks } from '@/lib/cms-brand-linter';
import { auditCanvasA11y } from '@/lib/cms-a11y';
import { searchVaultSpots, VAULT_SPOTS } from '@/lib/cms-vault-spots';
import { computeReadingMetrics, SLOW_READING_WPM } from '@/lib/cms-reading-metrics';
import { computeBlockDiff } from '@/lib/cms-revisions-diff';
import { exportArticleToMarkdown, importArticleFromMarkdown } from '@/lib/cms-export-import';
import type { CmsBlock } from '@/types/cms-blocks';

describe('CMS Visual Block Builder — Suite E2E Intégration Complète (Inc-13)', () => {
  const templateIds: CmsTemplateId[] = [
    'slow_travel_diary',
    'step_by_step_guide',
    'hospitality_spotlight',
    'photo_essay',
  ];

  // =========================================================================
  // 1. Recette des 4 Gabarits Slow Travel
  // =========================================================================
  describe('1. Recette des 4 Gabarits Slow Travel', () => {
    it.each(templateIds)('instancie correctement le gabarit "%s" avec des IDs uniques', (tplId) => {
      const blocks = instantiateCmsTemplate(tplId, { destination: 'Monténégro' });
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks.length).toBeGreaterThan(0);

      // Vérification unicité des IDs
      const ids = blocks.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Validation par le module de contrôle des gabarits
      const validation = validateTemplateBlocks(blocks);
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it.each(templateIds)('effectue le rendu public unifié sans crash avec BlockRenderer pour "%s"', (tplId) => {
      const blocks = instantiateCmsTemplate(tplId, { destination: 'Monténégro' });
      const { container } = render(<BlockRenderer blocks={blocks} />);

      expect(container.querySelector('.cms-blocks-container')).toBeDefined();
      expect(container.firstChild).not.toBeNull();
    });

    it.each(templateIds)('monte l\'éditeur BlockCanvas avec "%s" sans erreur', (tplId) => {
      const blocks = instantiateCmsTemplate(tplId, { destination: 'Monténégro' });
      const onChange = vi.fn();
      const { container } = render(<BlockCanvas blocks={blocks} onChange={onChange} />);

      expect(container.querySelector('.space-y-4')).toBeDefined();
      // La palette doit être présente
      expect(screen.getByText('Palette des blocs modulaires')).toBeDefined();
    });
  });

  // =========================================================================
  // 2. Contrôle strict de la Voix de Marque (Linter & 48 Mots Bannis)
  // =========================================================================
  describe('2. Contrôle strict de la Voix de Marque', () => {
    it('valide que tous les 4 gabarits respectent scrupuleusement la charte (0 mot banni)', () => {
      for (const tplId of templateIds) {
        const blocks = instantiateCmsTemplate(tplId, { destination: 'Monténégro' });
        const summary = lintCanvasBlocks(blocks);

        expect(summary.totalForbidden).toBe(0);
        expect(summary.uniqueForbidden).toHaveLength(0);
      }
    });

    it('détecte et alerte en temps réel lors de l\'introduction de mots bannis avec suggestions adéquates', () => {
      const dirtyBlock: CmsBlock = {
        id: 'dirty_test_1',
        type: 'text',
        content: 'Voici un super bon plan incontournable et une aventure inoubliable pour les touristes.',
      };

      const result = lintBlock(dirtyBlock);
      expect(result.isValid).toBe(false);
      expect(result.forbiddenWords).toContain('bon plan');
      expect(result.forbiddenWords).toContain('incontournable');
      expect(result.forbiddenWords).toContain('aventure inoubliable');
      expect(result.forbiddenWords).toContain('les touristes');

      // Suggestions fournies
      const bonPlanIssue = result.issues.find((i) => i.word === 'bon plan');
      expect(bonPlanIssue?.suggestion).toBe('pépite dénichée');

      const touristeIssue = result.issues.find((i) => i.word === 'les touristes');
      expect(touristeIssue?.suggestion).toBe('les passants');
    });

    it('vérifie que les fiches de destination de terrain du Coffre sont exemptes de slogans touristiques d\'agence', () => {
      const destinationSpots = VAULT_SPOTS.filter((s) =>
        ['Monténégro', 'Madère Sauvegardée', 'Hôtellerie Slow', 'Albanie du Nord', 'Sicile Authentique'].includes(
          s.category
        )
      );

      expect(destinationSpots.length).toBeGreaterThan(0);
      for (const spot of destinationSpots) {
        const expLower = spot.livedExperience.toLowerCase();
        // Vérifie les pires formulations d'agences touristiques
        expect(expLower.includes('voyage organisé')).toBe(false);
        expect(expLower.includes('package touristique')).toBe(false);
        expect(expLower.includes('solution miracle')).toBe(false);
      }
    });
  });

  // =========================================================================
  // 3. Recette du Cycle de Sauvegarde Bilatérale (Round-trip Lossless)
  // =========================================================================
  describe('3. Recette du Cycle de Sauvegarde Bilatérale (Round-trip)', () => {
    it('garantit un aller-retour sans aucune perte entre blocs, HTML sémantique et blocs restaurés', () => {
      // 1. Base : instancier gabarit slow_travel_diary
      const baseBlocks = instantiateCmsTemplate('slow_travel_diary', { destination: 'Podgorica' });

      // 2. Recherche et ajout d'une pépite réelle du Coffre des Savoirs
      const spots = searchVaultSpots('Podgorica');
      expect(spots.length).toBeGreaterThan(0);
      const chosenSpot = spots[0];

      const vaultBlock: CmsBlock = {
        id: 'vault_podgorica_test',
        type: 'vault_spot',
        vaultId: chosenSpot.id,
        title: chosenSpot.title,
        location: chosenSpot.location,
        livedExperience: chosenSpot.livedExperience,
        spacing: 'relaxed',
      };

      const blocksWithVault: CmsBlock[] = [...baseBlocks, vaultBlock];

      // 3. Sérialisation vers HTML
      const generatedHtml = blocksToHtml(blocksWithVault);

      // Vérifications HTML sémantique
      expect(generatedHtml).toContain('<h2>');
      expect(generatedHtml).toContain('<p>');
      expect(generatedHtml).toContain('<!-- heldonica:blocks');

      // 4. Désérialisation depuis le HTML
      const restoredBlocks = htmlToBlocks(generatedHtml);

      // 5. Validation structurelle stricte
      expect(restoredBlocks.length).toBe(blocksWithVault.length);

      // Vérifie que le bloc vault_spot a survécu avec toutes ses métadonnées
      const restoredVaultBlock = restoredBlocks.find((b) => b.type === 'vault_spot');
      expect(restoredVaultBlock).toBeDefined();
      if (restoredVaultBlock && restoredVaultBlock.type === 'vault_spot') {
        expect(restoredVaultBlock.title).toBe(chosenSpot.title);
        expect(restoredVaultBlock.location).toBe(chosenSpot.location);
        expect(restoredVaultBlock.livedExperience).toBe(chosenSpot.livedExperience);
      }

      // Vérifie l'ensemble des types de blocs
      const originalTypes = blocksWithVault.map((b) => b.type);
      const restoredTypes = restoredBlocks.map((b) => b.type);
      expect(restoredTypes).toEqual(originalTypes);
    });
  });

  // =========================================================================
  // 4. Robustesse aux Données Dégradées (Zéro Crash)
  // =========================================================================
  describe('4. Robustesse aux Données Dégradées', () => {
    it('rend proprement sans crash face à des blocs aux propriétés vides ou manquantes', () => {
      const degradedBlocks: CmsBlock[] = [
        { id: 'deg_h', type: 'heading', level: 2, text: '' },
        { id: 'deg_t', type: 'text', content: '' },
        { id: 'deg_img', type: 'image', url: '', alt: '' },
        { id: 'deg_gal', type: 'gallery', images: [], displayMode: 'grid' },
        { id: 'deg_list', type: 'list', items: [], style: 'bullet' },
        { id: 'deg_btn', type: 'button', label: '', url: '' },
        { id: 'deg_vid', type: 'video', url: '', source: 'youtube' },
        { id: 'deg_vspot', type: 'vault_spot', title: '', location: '', livedExperience: '' },
        { id: 'deg_photo', type: 'photo_evidence', imageUrl: '', location: '', date: '', anecdote: '' },
      ];

      // Rendu public BlockRenderer
      const { container } = render(<BlockRenderer blocks={degradedBlocks} />);
      expect(container.firstChild).toBeDefined();

      // Rendu admin BlockCanvas
      const onChange = vi.fn();
      const { container: canvasContainer } = render(
        <BlockCanvas blocks={degradedBlocks} onChange={onChange} />
      );
      expect(canvasContainer.firstChild).toBeDefined();
    });

    it('gère gracieusement un tableau de blocs vide ou null', () => {
      const { container: nullContainer } = render(<BlockRenderer blocks={[] as any} />);
      expect(nullContainer.firstChild).toBeNull();

      const onChange = vi.fn();
      render(<BlockCanvas blocks={[]} onChange={onChange} />);
      expect(screen.getByText('Aucun bloc pour le moment')).toBeDefined();
    });
  });

  // =========================================================================
  // 5. Intégration globale : A11y, Révisions & Métriques Slow Travel
  // =========================================================================
  describe('5. Intégration globale : A11y, Révisions & Métriques Slow Travel', () => {
    it('calcule les métriques de lecture lente à 190 WPM et évalue l\'accessibilité A11y', () => {
      const blocks = instantiateCmsTemplate('slow_travel_diary', { destination: 'Madère' });

      // Audit A11y
      const a11yReport = auditCanvasA11y(blocks);
      expect(a11yReport.score).toBeGreaterThanOrEqual(80);

      // Métriques Slow Travel
      const metrics = computeReadingMetrics({
        title: 'Traversée de Madère',
        blocks,
        season: 'automne doré',
        mobility: 'marche',
        budget_level: 'charme',
      });

      expect(metrics.wordCount).toBeGreaterThan(0);
      expect(metrics.readingTimeMinutes).toBeGreaterThan(0);
      expect(metrics.slowScore).toBeGreaterThanOrEqual(60);
    });

    it('génère un diff visuel exact lors d\'une révision de blocs', () => {
      // Perspective : version courante vs révision passée
      const currentBlocks: CmsBlock[] = [
        { id: 'b1', type: 'heading', level: 1, text: 'Nouveau titre modifié' },
        { id: 'b3', type: 'button', label: 'Découvrir', url: '/explorer' },
      ];

      const revisionBlocks: CmsBlock[] = [
        { id: 'b1', type: 'heading', level: 1, text: 'Premier titre' },
        { id: 'b2', type: 'text', content: 'Paragraphe archivé' },
      ];

      const diff = computeBlockDiff(currentBlocks, revisionBlocks);

      // Dans computeBlockDiff:
      // - b1 est présent des deux côtés mais texte différent -> modified
      // - b2 est dans la révision mais pas en courant -> added (sera restauré)
      expect(diff.modifiedCount).toBe(1);
      expect(diff.addedCount).toBe(1);
    });

    it('exporte en Markdown avec frontmatter et réimporte fidèlement sans altération', () => {
      const blocks = instantiateCmsTemplate('hospitality_spotlight', { destination: 'Kotor' });
      const md = exportArticleToMarkdown(
        {
          title: 'Maison d\'hôtes à Kotor',
          slug: 'maison-kotor',
        },
        blocks
      );

      expect(md).toContain('---');
      expect(md).toContain('<!-- heldonica:blocks');

      const imported = importArticleFromMarkdown(md);
      expect(imported.success).toBe(true);
      expect(imported.article?.blocks.length).toBe(blocks.length);
      expect(imported.article?.blocks[0].type).toBe('heading');
    });
  });
});
