import React from 'react';
import type { TextBlock as TextBlockType } from '@/types/cms-blocks';

interface Props {
  block: TextBlockType;
  className?: string;
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
          {p}
        </p>
      ))}
    </div>
  );
}
