/**
 * Heldonica CMS — Outils d'Import & Export d'articles (Markdown, JSON, HTML).
 * Respecte les principes AGENTS.md : typage strict pur TypeScript, réversibilité lossless.
 */

import matter from 'gray-matter';
import type { CmsBlock } from '@/types/cms-blocks';
import { blocksToHtml, htmlToBlocks } from '@/lib/cms-blocks-converter';
import { computeReadingMetrics, type ReadingMetricsResult } from '@/lib/cms-reading-metrics';

export interface ExportArticleInput {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status?: 'published' | 'draft' | 'scheduled' | 'review';
  category?: string;
  tags?: string[];
  featured_image?: string;
  author?: string;
  seo_title?: string;
  seo_description?: string;
  season?: string;
  mobility?: string;
  budget_level?: string;
  duration?: string;
  carbon_footprint?: string;
  photoUrl?: string;
  photoLocation?: string;
  photoDate?: string;
  photoAnecdote?: string;
  photoAlbumLink?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  [key: string]: unknown;
}

export interface ImportedArticle {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'published' | 'draft' | 'scheduled' | 'review';
  category?: string;
  tags?: string[];
  featured_image?: string;
  author?: string;
  seo_title?: string;
  seo_description?: string;
  season?: string;
  mobility?: string;
  budget_level?: string;
  duration?: string;
  carbon_footprint?: string;
  blocks: CmsBlock[];
}

export interface ImportArticleResult {
  success: boolean;
  article?: ImportedArticle;
  metrics?: ReadingMetricsResult;
  errors?: string[];
  warnings?: string[];
  detectedFormat: 'markdown' | 'json';
}

/**
 * Convertit une liste de blocs en représentation Markdown lisible.
 */
export function blocksToMarkdown(blocks: CmsBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const hashes = '#'.repeat(Math.min(block.level || 2, 6));
          const sub = block.subtitle ? `\n*${block.subtitle}*` : '';
          return `${hashes} ${block.text}${sub}`;
        }
        case 'text':
          return block.content;
        case 'image': {
          const cap = block.caption ? `\n*${block.caption}*` : '';
          return `![${block.alt || ''}](${block.url})${cap}`;
        }
        case 'gallery': {
          return block.images
            .map((img) => `![${img.alt || ''}](${img.url})`)
            .join('\n\n');
        }
        case 'list': {
          if (block.style === 'numbered') {
            return block.items.map((it, idx) => `${idx + 1}. ${it}`).join('\n');
          }
          return block.items.map((it) => `- ${it}`).join('\n');
        }
        case 'button':
          return `[${block.label}](${block.url})`;
        case 'vault_spot':
          return `> **📍 Pépite : ${block.title}** (${block.location})\n> ${block.livedExperience}`;
        case 'photo_evidence':
          return `![📍 ${block.location} – 📅 ${block.date}](${block.imageUrl})\n> *📍 ${block.location} – 📅 ${block.date}* : ${block.anecdote}`;
        case 'video':
          return `[Vidéo : ${block.url}](${block.url})`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Génère le contenu d'un export Markdown complet avec Frontmatter YAML et métadonnées lossless.
 */
export function exportArticleToMarkdown(article: ExportArticleInput, blocks?: CmsBlock[]): string {
  const frontmatter: Record<string, unknown> = {
    title: article.title || 'Sans titre',
    slug: article.slug || 'article-sans-slug',
    status: article.status || 'draft',
    excerpt: article.excerpt || '',
    category: article.category || 'Slow Travel',
    tags: Array.isArray(article.tags) ? article.tags : [],
    author: article.author || 'Heldonica',
  };

  if (article.featured_image) frontmatter.featured_image = article.featured_image;
  if (article.seo_title) frontmatter.seo_title = article.seo_title;
  if (article.seo_description) frontmatter.seo_description = article.seo_description;
  if (article.season) frontmatter.season = article.season;
  if (article.mobility) frontmatter.mobility = article.mobility;
  if (article.budget_level) frontmatter.budget_level = article.budget_level;
  if (article.duration) frontmatter.duration = article.duration;
  if (article.carbon_footprint) frontmatter.carbon_footprint = article.carbon_footprint;
  if (article.published_at) frontmatter.published_at = article.published_at;

  frontmatter.heldonica_version = '1.0';

  let body = '';
  if (blocks && blocks.length > 0) {
    const mdText = blocksToMarkdown(blocks);
    const blocksComment = `\n\n<!-- heldonica:blocks ${JSON.stringify(blocks)} -->`;
    body = `${mdText}${blocksComment}`;
  } else if (article.content) {
    body = article.content;
  }

  return matter.stringify(body.trim(), frontmatter);
}

/**
 * Génère un export JSON complet au format Heldonica standardisé.
 */
export function exportArticleToJson(article: ExportArticleInput, blocks?: CmsBlock[]): string {
  const activeBlocks = blocks && blocks.length > 0 ? blocks : htmlToBlocks(article.content || '');
  const metrics = computeReadingMetrics({
    title: article.title,
    excerpt: article.excerpt,
    blocks: activeBlocks,
    content: article.content,
    season: article.season,
    mobility: article.mobility,
    budget_level: article.budget_level,
    carbon_footprint: article.carbon_footprint,
  });

  const payload = {
    schema: 'heldonica_cms_article_v1',
    exported_at: new Date().toISOString(),
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status || 'draft',
      excerpt: article.excerpt || '',
      category: article.category || 'Slow Travel',
      tags: article.tags || [],
      featured_image: article.featured_image || '',
      author: article.author || 'Heldonica',
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      season: article.season || '',
      mobility: article.mobility || '',
      budget_level: article.budget_level || '',
      duration: article.duration || '',
      carbon_footprint: article.carbon_footprint || '',
      created_at: article.created_at,
      updated_at: article.updated_at,
      published_at: article.published_at,
    },
    blocks: activeBlocks,
    metrics: {
      word_count: metrics.wordCount,
      reading_time_minutes: metrics.readingTimeMinutes,
      slow_score: metrics.slowScore,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Génère un document HTML autonome prêt à être archivé ou imprimé.
 */
export function exportArticleToHtml(article: ExportArticleInput, blocks?: CmsBlock[]): string {
  const activeBlocks = blocks && blocks.length > 0 ? blocks : htmlToBlocks(article.content || '');
  const bodyHtml = blocksToHtml(activeBlocks);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.title || 'Article Heldonica')}</title>
  <meta name="description" content="${escapeHtml(article.excerpt || article.seo_description || '')}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif; line-height: 1.7; color: #1c1917; max-width: 760px; margin: 40px auto; padding: 0 20px; }
    h1 { font-family: Georgia, serif; font-size: 2.2rem; margin-bottom: 0.5rem; }
    .meta { color: #78716c; font-size: 0.9rem; margin-bottom: 2rem; border-bottom: 1px solid #e7e5e4; padding-bottom: 1rem; }
    .badge { display: inline-block; background: #f5f5f4; border: 1px solid #d6d3d1; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; margin-right: 6px; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
    blockquote { border-left: 3px solid #C4714A; padding-left: 1rem; margin: 1.5rem 0; color: #57534e; font-style: italic; }
    figcaption { font-size: 0.85rem; color: #78716c; text-align: center; margin-top: -0.5rem; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <article>
    <h1>${escapeHtml(article.title || 'Sans titre')}</h1>
    <div class="meta">
      ${article.author ? `<span>Par ${escapeHtml(article.author)}</span> · ` : ''}
      <span>${article.category || 'Slow Travel'}</span>
      ${article.season ? `<span class="badge">🍂 ${escapeHtml(article.season)}</span>` : ''}
      ${article.mobility ? `<span class="badge">🚆 ${escapeHtml(article.mobility)}</span>` : ''}
      ${article.budget_level ? `<span class="badge">🪙 ${escapeHtml(article.budget_level)}</span>` : ''}
    </div>
    ${article.excerpt ? `<p class="excerpt"><em>${escapeHtml(article.excerpt)}</em></p>` : ''}
    <div class="article-body">
      ${bodyHtml}
    </div>
  </article>
</body>
</html>`;
}

/**
 * Importe un article depuis un contenu brut Markdown.
 */
export function importArticleFromMarkdown(markdownRaw: string): ImportArticleResult {
  if (!markdownRaw || !markdownRaw.trim()) {
    return {
      success: false,
      errors: ['Le contenu Markdown fourni est vide.'],
      detectedFormat: 'markdown',
    };
  }

  const warnings: string[] = [];

  try {
    const parsed = matter(markdownRaw);
    const data = (parsed.data || {}) as Record<string, unknown>;
    const rawContent = parsed.content.trim();

    // 1. Extraction ou restauration des blocs
    let blocks: CmsBlock[] = [];
    const commentMatch = rawContent.match(/<!--\s*heldonica:blocks\s+([\s\S]*?)\s*-->/);
    if (commentMatch) {
      try {
        const jsonBlocks = JSON.parse(commentMatch[1]);
        if (Array.isArray(jsonBlocks) && jsonBlocks.length > 0) {
          blocks = jsonBlocks as CmsBlock[];
        }
      } catch {
        warnings.push('Commentaire de blocs altéré : reconstitution automatique via le parseur.');
      }
    }

    if (blocks.length === 0) {
      // Reconstitution à partir du corps Markdown
      blocks = htmlToBlocks(rawContent);
    }

    // 2. Extraction du titre (frontmatter ou premier # Titre)
    let title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : '';
    if (!title) {
      const headingBlock = blocks.find((b) => b.type === 'heading');
      if (headingBlock && headingBlock.type === 'heading') {
        title = headingBlock.text;
      } else {
        const firstHMatch = rawContent.match(/^#\s+(.+)$/m);
        title = firstHMatch ? firstHMatch[1].trim() : 'Article sans titre importé';
        warnings.push(`Titre manquant dans le frontmatter, inféré : « ${title} ».`);
      }
    }

    // 3. Extraction du slug
    let slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : '';
    if (!slug) {
      slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      warnings.push(`Slug manquant, généré automatiquement : « ${slug} ».`);
    }

    // 4. Extraction du statut avec repli sécurisé
    let status: 'published' | 'draft' | 'scheduled' | 'review' = 'draft';
    if (data.status === 'published' || data.status === 'review' || data.status === 'scheduled' || data.status === 'draft') {
      status = data.status;
    }

    // 5. Construction de l'objet article importé
    const article: ImportedArticle = {
      title,
      slug,
      content: blocksToHtml(blocks),
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
      status,
      category: typeof data.category === 'string' ? data.category : 'Slow Travel',
      tags: Array.isArray(data.tags) ? (data.tags.filter((t) => typeof t === 'string') as string[]) : [],
      featured_image: typeof data.featured_image === 'string' ? data.featured_image : undefined,
      author: typeof data.author === 'string' ? data.author : 'Heldonica',
      seo_title: typeof data.seo_title === 'string' ? data.seo_title : undefined,
      seo_description: typeof data.seo_description === 'string' ? data.seo_description : undefined,
      season: typeof data.season === 'string' ? data.season : undefined,
      mobility: typeof data.mobility === 'string' ? data.mobility : undefined,
      budget_level: typeof data.budget_level === 'string' ? data.budget_level : undefined,
      duration: typeof data.duration === 'string' ? data.duration : undefined,
      carbon_footprint: typeof data.carbon_footprint === 'string' ? data.carbon_footprint : undefined,
      blocks,
    };

    const metrics = computeReadingMetrics({
      title: article.title,
      excerpt: article.excerpt,
      blocks: article.blocks,
      content: article.content,
      season: article.season,
      mobility: article.mobility,
      budget_level: article.budget_level,
      carbon_footprint: article.carbon_footprint,
    });

    if (metrics.detectedForbiddenWords.length > 0) {
      warnings.push(
        `Présence de mots bannis détectée dans l'article importé (${metrics.detectedForbiddenWords.join(', ')}).`
      );
    }

    return {
      success: true,
      article,
      metrics,
      warnings: warnings.length > 0 ? warnings : undefined,
      detectedFormat: 'markdown',
    };
  } catch (err) {
    return {
      success: false,
      errors: [`Erreur de parsing Markdown : ${err instanceof Error ? err.message : String(err)}`],
      detectedFormat: 'markdown',
    };
  }
}

/**
 * Importe un article depuis un contenu JSON.
 */
export function importArticleFromJson(jsonRaw: string): ImportArticleResult {
  if (!jsonRaw || !jsonRaw.trim()) {
    return {
      success: false,
      errors: ['Le contenu JSON fourni est vide.'],
      detectedFormat: 'json',
    };
  }

  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonRaw);

    // Support des deux schémas : schema enveloppé { article, blocks } ou objet article direct
    const rawArticle = parsed.article || parsed;
    const rawBlocks = parsed.blocks || [];

    if (!rawArticle.title && !rawArticle.slug) {
      return {
        success: false,
        errors: ['Le fichier JSON ne contient ni titre ni slug d’article valide.'],
        detectedFormat: 'json',
      };
    }

    const title = rawArticle.title || 'Article sans titre importé';
    let slug = rawArticle.slug || '';
    if (!slug) {
      slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      warnings.push(`Slug manquant dans le JSON, généré automatiquement : « ${slug} ».`);
    }

    let blocks: CmsBlock[] = [];
    if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
      blocks = rawBlocks as CmsBlock[];
    } else if (rawArticle.content) {
      blocks = htmlToBlocks(rawArticle.content);
    }

    let status: 'published' | 'draft' | 'scheduled' | 'review' = 'draft';
    if (
      rawArticle.status === 'published' ||
      rawArticle.status === 'review' ||
      rawArticle.status === 'scheduled' ||
      rawArticle.status === 'draft'
    ) {
      status = rawArticle.status;
    }

    const article: ImportedArticle = {
      title,
      slug,
      content: blocksToHtml(blocks),
      excerpt: typeof rawArticle.excerpt === 'string' ? rawArticle.excerpt : '',
      status,
      category: typeof rawArticle.category === 'string' ? rawArticle.category : 'Slow Travel',
      tags: Array.isArray(rawArticle.tags) ? rawArticle.tags : [],
      featured_image: typeof rawArticle.featured_image === 'string' ? rawArticle.featured_image : undefined,
      author: typeof rawArticle.author === 'string' ? rawArticle.author : 'Heldonica',
      seo_title: typeof rawArticle.seo_title === 'string' ? rawArticle.seo_title : undefined,
      seo_description: typeof rawArticle.seo_description === 'string' ? rawArticle.seo_description : undefined,
      season: typeof rawArticle.season === 'string' ? rawArticle.season : undefined,
      mobility: typeof rawArticle.mobility === 'string' ? rawArticle.mobility : undefined,
      budget_level: typeof rawArticle.budget_level === 'string' ? rawArticle.budget_level : undefined,
      duration: typeof rawArticle.duration === 'string' ? rawArticle.duration : undefined,
      carbon_footprint: typeof rawArticle.carbon_footprint === 'string' ? rawArticle.carbon_footprint : undefined,
      blocks,
    };

    const metrics = computeReadingMetrics({
      title: article.title,
      excerpt: article.excerpt,
      blocks: article.blocks,
      content: article.content,
      season: article.season,
      mobility: article.mobility,
      budget_level: article.budget_level,
      carbon_footprint: article.carbon_footprint,
    });

    if (metrics.detectedForbiddenWords.length > 0) {
      warnings.push(
        `Présence de mots bannis détectée dans l'article importé (${metrics.detectedForbiddenWords.join(', ')}).`
      );
    }

    return {
      success: true,
      article,
      metrics,
      warnings: warnings.length > 0 ? warnings : undefined,
      detectedFormat: 'json',
    };
  } catch (err) {
    return {
      success: false,
      errors: [`Format JSON invalide : ${err instanceof Error ? err.message : String(err)}`],
      detectedFormat: 'json',
    };
  }
}

/**
 * Utilitaire de téléchargement de fichier côté navigateur.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
