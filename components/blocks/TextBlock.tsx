import React from 'react';
import type { TextBlock as TextBlockType } from '@/types/cms-blocks';

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

export function TextBlock({ block, className = '' }: Props) {
  const { content } = block;

  // Split into paragraphs if raw text with double newlines
  const paragraphs = content
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
