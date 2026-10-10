/**
 * Heldonica CMS — Convertisseur bidirectionnel Contenu <-> Blocs modulaires.
 * Assure la rétrocompatibilité totale avec les articles existants.
 */

import type {
  CmsBlock,
  TextBlock,
  HeadingBlock,
  ImageBlock,
  ButtonBlock,
  ListBlock,
  VideoBlock,
  VaultSpotBlock,
  PhotoEvidenceBlock,
} from '@/types/cms-blocks';

/**
 * Convertit un tableau de blocs modulaires en HTML sémantique propre.
 * Idéal pour le SEO, les flux RSS et la colonne de secours 'content'.
 */
export function blocksToHtml(blocks: CmsBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  const html = blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const tag = `h${block.level}`;
          const sub = block.subtitle ? `\n<p class="subtitle italic text-stone-500">${escapeHtml(block.subtitle)}</p>` : '';
          return `<${tag}>${escapeHtml(block.text)}</${tag}>${sub}`;
        }

        case 'text': {
          const paras = block.content
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean);
          return paras.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
        }

        case 'image': {
          const cap = block.caption ? `\n  <figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
          return `<figure>\n  <img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || '')}" />${cap}\n</figure>`;
        }

        case 'gallery': {
          const items = block.images
            .map(
              (img) =>
                `  <div class="gallery-item"><img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || '')}" /></div>`
            )
            .join('\n');
          return `<div class="heldonica-gallery" data-mode="${block.displayMode}">\n${items}\n</div>`;
        }

        case 'video': {
          if (block.source === 'youtube') {
            return `<div class="video-wrapper aspect-${block.aspectRatio === '9:16' ? 'vertical' : 'horizontal'}"><iframe src="${escapeHtml(block.url)}" allowfullscreen></iframe></div>`;
          }
          return `<video src="${escapeHtml(block.url)}" controls></video>`;
        }

        case 'button': {
          const target = block.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
          return `<p class="cta-button-container"><a href="${escapeHtml(block.url)}" class="btn-heldonica"${target}>${escapeHtml(block.label)}</a></p>`;
        }

        case 'list': {
          const tag = block.style === 'numbered' ? 'ol' : 'ul';
          const items = block.items.map((i) => `  <li>${escapeHtml(i)}</li>`).join('\n');
          return `<${tag} class="list-${block.style}">\n${items}\n</${tag}>`;
        }

        case 'vault_spot': {
          return `<aside class="vault-spot-highlight">\n  <strong>${escapeHtml(block.title)}</strong> (${escapeHtml(block.location)})\n  <blockquote>${escapeHtml(block.livedExperience)}</blockquote>\n</aside>`;
        }

        case 'photo_evidence': {
          const album = block.albumLink
            ? `\n  <p><a href="${escapeHtml(block.albumLink)}" target="_blank" rel="noopener noreferrer">Voir l’album</a></p>`
            : '';
          return `<figure class="photo-evidence">\n  <img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.anecdote || block.location)}" />\n  <figcaption>📍 ${escapeHtml(block.location)} – 📅 ${escapeHtml(block.date)}</figcaption>\n  <blockquote>${escapeHtml(block.anecdote)}</blockquote>${album}\n</figure>`;
        }

        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  // Sérialisation non destructive pour round-trip 100% fidèle et rétrocompatibilité totale
  const blocksComment = `\n\n<!-- heldonica:blocks ${JSON.stringify(blocks)} -->`;
  return html + blocksComment;
}

/**
 * Convertit du texte brut ou du HTML standard en liste initiale de CmsBlock.
 * Permet d'importer n'importe quel article existant directement dans le visual builder.
 */
export function htmlToBlocks(rawTextOrHtml: string): CmsBlock[] {
  if (!rawTextOrHtml || !rawTextOrHtml.trim()) {
    return [];
  }

  const clean = rawTextOrHtml.trim();

  // 1. Détection prioritaire des blocs structurés intégrés en commentaire (Gutenberg / Heldonica pattern)
  const commentMatch = clean.match(/<!--\s*heldonica:blocks\s+([\s\S]*?)\s*-->/);
  if (commentMatch) {
    try {
      const parsed = JSON.parse(commentMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CmsBlock[];
      }
    } catch {
      // En cas de commentaire altéré manuellement, fallback fluide sur le parseur sémantique ci-dessous
    }
  }

  const blocks: CmsBlock[] = [];
  let counter = 0;
  const nextId = (prefix: string) => `blk_${prefix}_${Date.now().toString(36)}_${(++counter).toString(36)}`;

  // Découpage grossier si HTML contenant des balises blocs
  const hasHtmlTags = /<(?:p|h[1-6]|figure|img|blockquote|ul|ol|iframe|aside)[\s>]/i.test(clean);

  if (!hasHtmlTags) {
    // Cas texte brut classique découpé par double retours à la ligne
    const paragraphs = clean.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paragraphs.forEach((p) => {
      // Détecte si la ligne ressemble à un titre Markdown (# Titre)
      if (p.startsWith('# ')) {
        blocks.push({
          id: nextId('h'),
          type: 'heading',
          level: 1,
          text: p.replace(/^#\s+/, ''),
        });
      } else if (p.startsWith('## ')) {
        blocks.push({
          id: nextId('h'),
          type: 'heading',
          level: 2,
          text: p.replace(/^##\s+/, ''),
        });
      } else if (p.startsWith('### ')) {
        blocks.push({
          id: nextId('h'),
          type: 'heading',
          level: 3,
          text: p.replace(/^###\s+/, ''),
        });
      } else {
        blocks.push({
          id: nextId('txt'),
          type: 'text',
          content: p,
        });
      }
    });
    return blocks;
  }

  // Cas HTML : extraction par regex sémantiques basiques
  // 1. Extraire les balises principales dans l'ordre
  const blockRegex = /<(h[1-4]|p|figure|ul|ol|iframe|aside)[^>]*>([\s\S]*?)<\/\1>|<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(clean)) !== null) {
    const [fullMatch, tag, innerContent, imgSrc] = match;

    if (imgSrc) {
      blocks.push({
        id: nextId('img'),
        type: 'image',
        url: imgSrc,
        alt: 'Illustration',
        layout: 'wide',
        aspectRatio: '16:9',
      });
      continue;
    }

    const tagName = tag?.toLowerCase();

    if (tagName?.startsWith('h')) {
      const level = parseInt(tagName[1], 10) as 1 | 2 | 3 | 4;
      const text = stripTags(innerContent);
      if (text) {
        blocks.push({
          id: nextId('h'),
          type: 'heading',
          level: level || 2,
          text,
        });
      }
    } else if (tagName === 'aside' && fullMatch.includes('vault-spot-highlight')) {
      const titleMatch = innerContent.match(/<strong>([\s\S]*?)<\/strong>\s*\(([^)]+)\)/i);
      const quoteMatch = innerContent.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
      if (titleMatch) {
        blocks.push({
          id: nextId('vault'),
          type: 'vault_spot',
          spotId: 'legacy-spot',
          title: stripTags(titleMatch[1]),
          location: stripTags(titleMatch[2]),
          livedExperience: quoteMatch ? stripTags(quoteMatch[1]) : '',
        });
      }
    } else if (tagName === 'figure') {
      const srcMatch = innerContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      const capMatch = innerContent.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      const quoteMatch = innerContent.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
      const linkMatch = innerContent.match(/<a[^>]+href=["']([^"']+)["']/i);

      if (fullMatch.includes('photo-evidence') && srcMatch) {
        const figcap = capMatch ? stripTags(capMatch[1]) : '';
        const parts = figcap.split('–');
        const loc = parts[0]?.replace('📍', '').trim() || 'Lieu certifié';
        const date = parts[1]?.replace('📅', '').trim() || new Date().toISOString().split('T')[0];
        blocks.push({
          id: nextId('photo'),
          type: 'photo_evidence',
          imageUrl: srcMatch[1],
          location: loc,
          date,
          anecdote: quoteMatch ? stripTags(quoteMatch[1]) : '',
          albumLink: linkMatch ? linkMatch[1] : undefined,
        });
      } else if (srcMatch) {
        blocks.push({
          id: nextId('img'),
          type: 'image',
          url: srcMatch[1],
          alt: 'Photo',
          caption: capMatch ? stripTags(capMatch[1]) : undefined,
          layout: 'wide',
          aspectRatio: '16:9',
        });
      }
    } else if (tagName === 'ul' || tagName === 'ol') {
      const items: string[] = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch: RegExpExecArray | null;
      while ((liMatch = liRegex.exec(innerContent)) !== null) {
        const text = stripTags(liMatch[1]);
        if (text) items.push(text);
      }
      if (items.length > 0) {
        blocks.push({
          id: nextId('list'),
          type: 'list',
          items,
          style: tagName === 'ol' ? 'numbered' : 'bullet',
        });
      }
    } else if (tagName === 'p') {
      const text = stripTags(innerContent);
      if (text) {
        blocks.push({
          id: nextId('txt'),
          type: 'text',
          content: text,
        });
      }
    }
  }

  // Fallback si rien n'a été matché
  if (blocks.length === 0) {
    blocks.push({
      id: nextId('txt'),
      type: 'text',
      content: stripTags(clean),
    });
  }

  return blocks;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
