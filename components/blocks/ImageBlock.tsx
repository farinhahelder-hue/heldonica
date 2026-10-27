import React from 'react';
import type { ImageBlock as ImageBlockType } from '@/types/cms-blocks';

interface Props {
  block: ImageBlockType;
  className?: string;
}

export function ImageBlock({ block, className = '' }: Props) {
  const { url, alt, caption, layout = 'wide', aspectRatio = '16:9', hotspot } = block;

  if (!url) {
    return (
      <div className="w-full bg-[#EFE9DF] rounded-sm p-8 border border-dashed border-[#DED5C6] text-center text-charcoal/50 text-sm">
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

  // Point focal / Hotspot intelligent Sanity-style
  const focalStyle: React.CSSProperties = hotspot
    ? { objectPosition: `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%` }
    : { objectPosition: '50% 50%' };

  return (
    <figure className={`my-8 ${layoutClasses} ${className}`}>
      <div className={`relative overflow-hidden rounded-sm bg-[#EFE9DF] border border-[#E2D9C8] ${aspectClasses}`}>
        <img
          src={url}
          alt={alt || 'Photo de voyage'}
          loading="lazy"
          style={focalStyle}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-xs md:text-sm text-charcoal/60 mt-2.5 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
