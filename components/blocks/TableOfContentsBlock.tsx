'use client';

import React from 'react';
import type { TableOfContentsBlock as TOCBlockType, CmsBlock, HeadingBlock } from '@/types/cms-blocks';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  block: TOCBlockType;
  allBlocks?: CmsBlock[];
  className?: string;
}

export function TableOfContentsBlock({ block, allBlocks = [], className = '' }: Props) {
  const { title = 'Au fil du carnet', maxLevel = 2, displayStyle = 'numbered' } = block;

  const headings = allBlocks.filter(
    (b): b is HeadingBlock => b.type === 'heading' && b.level <= maxLevel
  );

  if (headings.length === 0) {
    return null;
  }

  const renderHeading = (heading: HeadingBlock, index: number) => {
    const slug = slugify(heading.text);
    const isH3 = heading.level === 3;
    
    // Style de base du lien
    const linkStyle = "block text-stone-700 hover:text-teal-800 transition-colors font-medium";
    const nestedClass = isH3 ? "ml-6 text-sm text-stone-600 font-normal" : "text-base";

    if (displayStyle === 'cards') {
      return (
        <a 
          key={heading.id} 
          href={`#${slug}`}
          className={`block p-3 bg-white border border-stone-200 rounded-xl hover:border-teal-500 hover:shadow-sm transition-all ${isH3 ? 'ml-6 bg-stone-50' : ''}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-teal-700 font-serif font-bold text-lg mt-[-2px] opacity-60">
              {isH3 ? '◦' : `${index + 1}.`}
            </span>
            <span className="font-medium text-stone-800 leading-snug">{heading.text}</span>
          </div>
        </a>
      );
    }

    if (displayStyle === 'list') {
      return (
        <li key={heading.id} className="mb-2 last:mb-0">
          <a href={`#${slug}`} className={`${linkStyle} ${nestedClass} flex items-baseline gap-2`}>
            <span className="text-teal-600 text-[10px] shrink-0">{isH3 ? '◦' : '•'}</span>
            <span className="leading-snug">{heading.text}</span>
          </a>
        </li>
      );
    }

    // Default: 'numbered'
    return (
      <li key={heading.id} className="mb-3 last:mb-0">
        <a href={`#${slug}`} className={`${linkStyle} ${nestedClass} flex items-baseline gap-3 group`}>
          {!isH3 && (
            <span className="text-stone-400 font-serif font-bold group-hover:text-teal-600 transition-colors w-4 text-right shrink-0">
              {index + 1}.
            </span>
          )}
          {isH3 && (
            <span className="text-stone-300 font-bold group-hover:text-teal-500 transition-colors w-4 text-right shrink-0">
              -
            </span>
          )}
          <span className="leading-snug">{heading.text}</span>
        </a>
      </li>
    );
  };

  // Assignation d'un index "virtuel" pour les H2 uniquement, pour la numérotation continue
  let h2Count = 0;
  const renderedHeadings = headings.map((h) => {
    if (h.level === 2) {
      const idx = h2Count;
      h2Count++;
      return renderHeading(h, idx);
    }
    return renderHeading(h, 0); // L'index n'est pas utilisé pour les H3 de toute façon
  });

  return (
    <nav className={`w-full bg-amber-50/60 border border-teal-100/50 rounded-2xl p-6 md:p-8 my-8 shadow-sm ${className}`} aria-label="Sommaire">
      {title && (
        <h2 className="text-xl md:text-2xl font-serif text-stone-900 font-medium mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-teal-600/80 rounded-full inline-block" />
          <span>{title}</span>
        </h2>
      )}
      
      {displayStyle === 'cards' ? (
        <div className="space-y-3">
          {renderedHeadings}
        </div>
      ) : (
        <ul className="list-none p-0 m-0">
          {renderedHeadings}
        </ul>
      )}
    </nav>
  );
}
