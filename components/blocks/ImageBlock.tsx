import React from 'react';
import type { ImageBlock as ImageBlockType } from '@/types/cms-blocks';

interface Props {
  block: ImageBlockType;
  className?: string;
}

export function ImageBlock({ block, className = '' }: Props) {
  const { url, alt, caption, layout = 'wide', aspectRatio = '16:9' } = block;

  if (!url) {
    return (
      <div className="w-full bg-stone-100 rounded-xl p-8 border border-dashed border-stone-300 text-center text-stone-400 text-sm">
        Image non renseignée
      </div>
    );
  }

  const layoutClasses = {
    inline: 'max-w-xl mx-auto',
    wide: 'max-w-4xl mx-auto',
    fullwidth: 'w-full',
  }[layout] || 'max-w-4xl mx-auto';

  const aspectClasses = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    'auto': 'h-auto',
  }[aspectRatio] || 'aspect-[16/9]';

  return (
    <figure className={`my-8 ${layoutClasses} ${className}`}>
      <div className={`relative overflow-hidden rounded-2xl bg-stone-100 shadow-sm ${aspectClasses}`}>
        <img
          src={url}
          alt={alt || 'Photo de voyage'}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-xs md:text-sm text-stone-500 mt-2.5 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
