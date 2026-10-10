/**
 * Heldonica CMS — Moteur d'Ingestion & Migration Automatique des Articles vers Blocs Modulaires
 * Inc-16 : Traitement idempotent des articles existants (WordPress & Classic HTML).
 *
 * Règle AGENTS.md n°1 : On n'invente rien. Préservation absolue des contenus.
 * Règle n°2 : Typage strict pur TypeScript, zéro dépendance tierce superflue.
 */

import type { CmsBlock } from '@/types/cms-blocks';
import { htmlToBlocks, blocksToHtml } from '@/lib/cms-blocks-converter';
import { computeReadingMetrics, type ReadingMetricsResult } from '@/lib/cms-reading-metrics';
import { auditCanvasA11y, type A11yReport } from '@/lib/cms-a11y';
import { lintCanvasBlocks, type CanvasLintSummary } from '@/lib/cms-brand-linter';

export interface MigrationOptions {
  cleanupWordPressNoise?: boolean;
  detectPhotoEvidence?: boolean;
  destinationFallback?: string;
}

export interface SingleArticleMigrationResult {
  alreadyConverted: boolean;
  changed: boolean;
  originalBlockCount: number;
  finalBlockCount: number;
  blocks: CmsBlock[];
  migratedHtml: string;
  metrics: ReadingMetricsResult;
  a11y: A11yReport;
  lint: CanvasLintSummary;
  warnings: string[];
}

export interface ArticleInputForMigration {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  season?: string;
  mobility?: string;
  budget_level?: string;
  carbon_footprint?: string;
}

export interface BatchMigrationReport {
  totalProcessed: number;
  alreadyConvertedCount: number;
  migratedCount: number;
  errorCount: number;
  results: Array<{
    id: number;
    slug: string;
    title: string;
    status: 'already_converted' | 'migrated' | 'error';
    blockCount: number;
    error?: string;
    readingTimeFormatted?: string;
    slowScore?: number;
  }>;
}

/**
 * Détermine si le contenu HTML possède déjà une sérialisation lossless par blocs valide.
 */
export function isArticleConvertedToBlocks(content: string | null | undefined): boolean {
  if (!content) return false;
  const match = content.match(/<!--\s*heldonica:blocks\s+([\s\S]*?)\s*-->/);
  if (!match) return false;

  try {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Nettoie les artefacts hérités de WordPress (classes CSS internes, balises vides, commentaires wp).
 */
export function cleanLegacyWordPressHtml(html: string): string {
  if (!html) return '';

  return html
    // Supprime les commentaires WordPress <!-- wp:... --> et <!-- /wp:... -->
    .replace(/<!--\s*\/?wp:[^>]*-->/gi, '')
    // Nettoie les classes CSS WordPress inutiles (ex: wp-image-*, size-large, etc.)
    .replace(/\s*class=["'][^"']*["']/gi, (match) => {
      const inner = match.replace(/^.*?=["']|["']$/g, '');
      const remaining = inner
        .split(/\s+/)
        .filter((c) => !c.startsWith('wp-') && !c.startsWith('size-') && !c.startsWith('align'))
        .join(' ');
      return remaining ? ` class="${remaining}"` : '';
    })
    // Supprime les paragraphes vides ou ne contenant qu'un espace insécable
    .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
    // Supprime les attributs srcset résiduels de serveurs WordPress éteints
    .replace(/\ssrcset=["'][^"']*["']/gi, '')
    .replace(/\ssizes=["'][^"']*["']/gi, '')
    .trim();
}

/**
 * Migre le contenu brut d'un article vers l'arbre de blocs modulaires Heldonica.
 * Fonction strictement idempotente : si l'article est déjà en blocs, il n'est pas altéré.
 */
export function migrateArticleContentToBlocks(
  rawContent: string | null | undefined,
  metadata?: {
    title?: string;
    season?: string;
    mobility?: string;
    budget_level?: string;
    carbon_footprint?: string;
  },
  options: MigrationOptions = {}
): SingleArticleMigrationResult {
  const warnings: string[] = [];
  const content = rawContent || '';

  // 1. Vérification idempotence : l'article a-t-il déjà ses blocs lossless ?
  if (isArticleConvertedToBlocks(content)) {
    const existingBlocks = htmlToBlocks(content);
    const metrics = computeReadingMetrics({
      title: metadata?.title,
      blocks: existingBlocks,
      content,
      season: metadata?.season,
      mobility: metadata?.mobility,
      budget_level: metadata?.budget_level,
      carbon_footprint: metadata?.carbon_footprint,
    });
    const a11y = auditCanvasA11y(existingBlocks);
    const lint = lintCanvasBlocks(existingBlocks);

    return {
      alreadyConverted: true,
      changed: false,
      originalBlockCount: existingBlocks.length,
      finalBlockCount: existingBlocks.length,
      blocks: existingBlocks,
      migratedHtml: content,
      metrics,
      a11y,
      lint,
      warnings: [],
    };
  }

  // 2. Pré-traitement et nettoyage du HTML hérité
  const shouldClean = options.cleanupWordPressNoise !== false;
  const cleanedHtml = shouldClean ? cleanLegacyWordPressHtml(content) : content;

  // 3. Conversion du HTML vers les blocs modulaires
  let blocks = htmlToBlocks(cleanedHtml);
  const originalBlockCount = blocks.length;

  if (blocks.length === 0) {
    warnings.push('Aucun bloc n\'a pu être extrait. Un bloc texte vide a été instancié par précaution.');
    blocks = [
      {
        id: `blk_txt_${Date.now().toString(36)}`,
        type: 'text',
        content: '',
      },
    ];
  }

  // 4. Détection optionnelle des preuves photos (PhotoEvidenceBlock)
  if (options.detectPhotoEvidence) {
    blocks = blocks.map((block) => {
      if (block.type === 'image' && block.caption) {
        const cap = block.caption;
        // Si la légende contient un repère de lieu 📍 ou de date de terrain
        const hasPin = cap.includes('📍') || /terrain|immersion|halte|recoin/i.test(cap);
        const dateMatch = cap.match(/\b(20\d{2}[-/.]\d{2}[-/.]\d{2}|[0-3]?\d\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+20\d{2})\b/i);

        if (hasPin) {
          const locClean = cap.replace(/^[📍\s-]+/, '').split(/[-–—|]/)[0]?.trim() || 'Lieu de terrain';
          return {
            id: block.id,
            type: 'photo_evidence',
            imageUrl: block.url,
            location: locClean,
            date: dateMatch ? dateMatch[0] : '2026',
            anecdote: cap,
            spacing: block.spacing || 'normal',
          };
        }
      }
      return block;
    });
  }

  // 5. Re-génération du HTML canonique avec la signature lossless invisible
  const migratedHtml = blocksToHtml(blocks);

  // 6. Calcul des métriques de lecture Slow Travel
  const metrics = computeReadingMetrics({
    title: metadata?.title,
    blocks,
    content: migratedHtml,
    season: metadata?.season,
    mobility: metadata?.mobility,
    budget_level: metadata?.budget_level,
    carbon_footprint: metadata?.carbon_footprint,
  });

  // 7. Audit d'accessibilité WCAG 2.1
  const a11y = auditCanvasA11y(blocks);

  // 8. Linter de conformité de voix
  const lint = lintCanvasBlocks(blocks);

  return {
    alreadyConverted: false,
    changed: true,
    originalBlockCount,
    finalBlockCount: blocks.length,
    blocks,
    migratedHtml,
    metrics,
    a11y,
    lint,
    warnings,
  };
}

/**
 * Traite un lot d'articles pour migrer les contenus hérités sans altérer les articles déjà à jour.
 */
export function batchMigrateArticles(
  articles: ArticleInputForMigration[],
  options: MigrationOptions = {}
): BatchMigrationReport {
  let alreadyConvertedCount = 0;
  let migratedCount = 0;
  let errorCount = 0;

  const results: BatchMigrationReport['results'] = [];

  for (const art of articles) {
    try {
      const res = migrateArticleContentToBlocks(
        art.content,
        {
          title: art.title,
          season: art.season,
          mobility: art.mobility,
          budget_level: art.budget_level,
          carbon_footprint: art.carbon_footprint,
        },
        options
      );

      if (res.alreadyConverted) {
        alreadyConvertedCount++;
        results.push({
          id: art.id,
          slug: art.slug,
          title: art.title,
          status: 'already_converted',
          blockCount: res.finalBlockCount,
          readingTimeFormatted: res.metrics.readingTimeFormatted,
          slowScore: res.metrics.slowScore,
        });
      } else {
        migratedCount++;
        results.push({
          id: art.id,
          slug: art.slug,
          title: art.title,
          status: 'migrated',
          blockCount: res.finalBlockCount,
          readingTimeFormatted: res.metrics.readingTimeFormatted,
          slowScore: res.metrics.slowScore,
        });
      }
    } catch (err: any) {
      errorCount++;
      results.push({
        id: art.id,
        slug: art.slug,
        title: art.title,
        status: 'error',
        blockCount: 0,
        error: err?.message || 'Erreur inconnue lors de la migration',
      });
    }
  }

  return {
    totalProcessed: articles.length,
    alreadyConvertedCount,
    migratedCount,
    errorCount,
    results,
  };
}
