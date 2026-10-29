import React from 'react';
import type { TextBlock as TextBlockType, RichTextBlock, TextSpan } from '@/types/cms-blocks';

interface Props {
  block: TextBlockType;
  className?: string;
}

/**
 * Rend le gras markdown (**texte**) en <strong>, sans injection HTML.
 * Le type TextBlock annonce « Supporte HTML sain ou Markdown » ; le gras était
 * jusqu'ici affiché littéralement. Les autres marqueurs sont laissés tels quels.
 */
function renderInline(texte: string): React.ReactNode {
  const parties = texte.split(/(\*\*[^*]+\*\*)/g);
  if (parties.length === 1) return texte;
  return parties.map((partie, i) => {
    const gras = partie.match(/^\*\*([^*]+)\*\*$/);
    return gras ? <strong key={i}>{gras[1]}</strong> : <React.Fragment key={i}>{partie}</React.Fragment>;
  });
}

function renderRichSpan(c: TextSpan): React.ReactNode {
  let node: React.ReactNode = c.text || ' ';
  if (c.marks.includes('strong')) node = <strong key="s">{node}</strong>;
  if (c.marks.includes('em')) node = <em key="e">{node}</em>;
  if (c.marks.includes('underline')) node = <u key="u">{node}</u>;
  if (c.marks.includes('highlight')) node = <span className="rich-highlight" key="h">{node}</span>;
  if (c.marks.includes('link') && c.href) {
    node = <a key="l" href={c.href} target="_blank" rel="noopener noreferrer">{node}</a>;
  }
  return node;
}

export function TextBlock({ block, className = '' }: Props) {
  // Portable Text (modèle Sanity-style) prioritaire sur le texte plat legacy
  if (block.richText && block.richText.length > 0) {
    return (
      <div className={`prose prose-stone max-w-none text-charcoal/90 leading-relaxed font-sans text-base md:text-lg ${className}`}>
        {block.richText.map((b, bi) => (
          <p key={bi} className="my-4 leading-relaxed">
            {b.children.map((c, si) => (
              <React.Fragment key={si}>{renderRichSpan(c)}</React.Fragment>
            ))}
          </p>
        ))}
      </div>
    );
  }

  const { content } = block;

  // Split into paragraphs if raw text with double newlines
  const paragraphs = (content || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className={`prose prose-stone max-w-none text-charcoal/90 leading-relaxed font-sans text-base md:text-lg ${className}`}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="my-4 leading-relaxed">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}
