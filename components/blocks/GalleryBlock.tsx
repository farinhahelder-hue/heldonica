'use client';

import React, { useState } from 'react';
import type { GalleryBlock as GalleryBlockType } from '@/types/cms-blocks';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  block: GalleryBlockType;
  className?: string;
}

export function GalleryBlock({ block, className = '' }: Props) {
  const { images, displayMode = 'grid_2' } = block;
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-stone-100 rounded-xl p-8 border border-dashed border-stone-300 text-center text-stone-400 text-sm">
        Galerie vide
      </div>
    );
  }

  // 1. Mode Carrousel
  if (displayMode === 'carousel') {
    const prev = () => setCarouselIndex((prevIdx) => (prevIdx > 0 ? prevIdx - 1 : images.length - 1));
    const next = () => setCarouselIndex((prevIdx) => (prevIdx < images.length - 1 ? prevIdx + 1 : 0));
    const current = images[carouselIndex];

    return (
      <div className={`relative my-8 rounded-2xl overflow-hidden bg-stone-900 group ${className}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={current.url}
            alt={current.alt || 'Photo de voyage'}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {current.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-sm text-center">
              {current.caption}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  aria-label={`Aller à l'image ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === carouselIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // 2. Modes Grille (2 colonnes ou 3 colonnes)
  const gridCols = displayMode === 'grid_3' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`my-8 grid ${gridCols} gap-4 ${className}`}>
      {images.map((img, idx) => (
        <figure key={idx} className="relative group overflow-hidden rounded-xl bg-stone-100">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={img.url}
              alt={img.alt || 'Photo galerie'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {img.caption && (
            <figcaption className="text-xs text-stone-500 p-2 text-center bg-stone-50/80">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
