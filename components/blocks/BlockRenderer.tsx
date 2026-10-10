'use client';

import React from 'react';
import type { CmsBlock, BlockSpacing, BlockTheme } from '@/types/cms-blocks';
import { TextBlock } from './TextBlock';
import { HeadingBlock } from './HeadingBlock';
import { ImageBlock } from './ImageBlock';
import { GalleryBlock } from './GalleryBlock';
import { VideoBlock } from './VideoBlock';
import { ButtonBlock } from './ButtonBlock';
import { ListBlock } from './ListBlock';
import { VaultSpotBlock } from './VaultSpotBlock';
import { PhotoEvidenceBlock } from './PhotoEvidenceBlock';

interface BlockRendererProps {
  blocks: CmsBlock[];
  className?: string;
}

const getSpacingClass = (spacing?: BlockSpacing): string => {
  switch (spacing) {
    case 'compact':
      return 'mb-4';
    case 'relaxed':
      return 'mb-12';
    case 'normal':
    default:
      return 'mb-8';
  }
};

const getThemeClass = (theme?: BlockTheme): string => {
  switch (theme) {
    case 'sand':
      return 'bg-amber-50/50 p-6 rounded-2xl';
    case 'dark':
      return 'bg-stone-900 text-stone-100 p-6 rounded-2xl';
    case 'gold_accent':
      return 'border-l-4 border-amber-500 pl-4';
    case 'default':
    default:
      return '';
  }
};

export function BlockRenderer({ blocks, className = '' }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={`cms-blocks-container w-full max-w-4xl mx-auto ${className}`}>
      {blocks.map((block) => {
        const spacing = getSpacingClass(block.spacing);
        const theme = getThemeClass(block.theme);
        const wrapperClass = `${spacing} ${theme}`.trim();

        switch (block.type) {
          case 'heading':
            return <HeadingBlock key={block.id} block={block} className={wrapperClass} />;
          case 'text':
            return <TextBlock key={block.id} block={block} className={wrapperClass} />;
          case 'image':
            return <ImageBlock key={block.id} block={block} className={wrapperClass} />;
          case 'gallery':
            return <GalleryBlock key={block.id} block={block} className={wrapperClass} />;
          case 'video':
            return <VideoBlock key={block.id} block={block} className={wrapperClass} />;
          case 'button':
            return <ButtonBlock key={block.id} block={block} className={wrapperClass} />;
          case 'list':
            return <ListBlock key={block.id} block={block} className={wrapperClass} />;
          case 'vault_spot':
            return <VaultSpotBlock key={block.id} block={block} className={wrapperClass} />;
          case 'photo_evidence':
            return <PhotoEvidenceBlock key={block.id} block={block} className={wrapperClass} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlockRenderer;
