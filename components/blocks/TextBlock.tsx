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
  if (c.marks.includes('code')) node = <code key="c" className="bg-stone-100 px-1 rounded text-xs font-mono">{node}</code>;
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
        {block.richText.map((b, bi) => {
          if (b._type === 'image') {
            return (
              <figure key={bi} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.url} alt={b.alt || ''} loading="lazy" className="w-full rounded-sm border border-stone-200" />
                {b.caption && <figcaption className="text-center text-xs italic text-stone-500 mt-2">{b.caption}</figcaption>}
              </figure>
            );
          }
          if (b._type === 'code') {
            return (
              <pre key={bi} className="my-4 p-4 bg-stone-900 text-stone-100 rounded-xl overflow-x-auto text-xs font-mono">
                <code>{b.code}</code>
              </pre>
            );
          }
          if (b._type === 'list') {
            const Tag = b.style === 'number' ? 'ol' : 'ul';
            return (
              <Tag key={bi} className="my-4 pl-6 space-y-1">
                {b.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    {item.map((c, si) => (
                      <React.Fragment key={si}>{renderRichSpan(c)}</React.Fragment>
                    ))}
                  </li>
                ))}
              </Tag>
            );
          }
          const Tag = (b.style === 'h1' ? 'h1' : b.style === 'h2' ? 'h2' : b.style === 'h3' ? 'h3' : b.style === 'h4' ? 'h4' : b.style === 'blockquote' ? 'blockquote' : 'p') as keyof JSX.IntrinsicElements;
          return (
            <Tag key={bi} className="my-4 leading-relaxed">
              {b.children.map((c, si) => (
                <React.Fragment key={si}>{renderRichSpan(c)}</React.Fragment>
              ))}
            </Tag>
          );
        })}
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
