import React from 'react';
import type { ButtonBlock as ButtonBlockType } from '@/types/cms-blocks';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  block: ButtonBlockType;
  className?: string;
}

export function ButtonBlock({ block, className = '' }: Props) {
  const { label, url, variant = 'primary_gold', openInNewTab = false } = block;

  const variantStyles = {
    primary_gold: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white',
    subtle: 'bg-stone-100 hover:bg-stone-200 text-stone-800',
  }[variant] || 'bg-amber-600 text-white';

  return (
    <div className={`my-6 flex justify-center ${className}`}>
      <a
        href={url || '#'}
        target={openInNewTab ? '_blank' : '_self'}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm md:text-base transition-all duration-300 transform active:scale-95 ${variantStyles}`}
      >
        <span>{label}</span>
        {openInNewTab ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
      </a>
    </div>
  );
}
