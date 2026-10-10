import React from 'react';
import type { ListBlock as ListBlockType } from '@/types/cms-blocks';
import { Check } from 'lucide-react';

interface Props {
  block: ListBlockType;
  className?: string;
}

export function ListBlock({ block, className = '' }: Props) {
  const { items, style = 'bullet' } = block;

  if (!items || items.length === 0) {
    return null;
  }

  if (style === 'checklist') {
    return (
      <div className={`my-6 bg-stone-50/80 rounded-2xl p-6 border border-stone-200/80 ${className}`}>
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-stone-800 text-base">
              <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (style === 'numbered') {
    return (
      <ol className={`my-6 space-y-2.5 list-none counter-reset-item ${className}`}>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3.5 text-stone-800 text-base md:text-lg">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
              {idx + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className={`my-6 space-y-2 text-stone-800 text-base md:text-lg pl-2 ${className}`}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="text-amber-600 mt-1.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
