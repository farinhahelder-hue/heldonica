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
    primary_gold: 'bg-action hover:bg-action-fonce text-white',
    outline: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-white',
    subtle: 'bg-[#EFE9DF] hover:bg-[#E2D9C8] text-charcoal border border-[#DED5C6]',
  }[variant] || 'bg-action text-white';

  return (
    <div className={`my-6 flex justify-center ${className}`}>
      <a
        href={url || '#'}
        target={openInNewTab ? '_blank' : '_self'}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-sm font-medium text-sm md:text-base transition-colors ${variantStyles}`}
      >
        <span>{label}</span>
        {openInNewTab ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
      </a>
    </div>
  );
}
