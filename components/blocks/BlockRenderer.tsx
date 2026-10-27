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
import { MapBlock } from './MapBlock';
import { TableOfContentsBlock } from './TableOfContentsBlock';
import { HospitalitySpotBlock } from './HospitalitySpotBlock';

interface BlockRendererProps {
  blocks: CmsBlock[];
  className?: string;
  interactivePreview?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
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
      return 'bg-[#FAF7F2] border border-[#DED5C6] p-6 rounded-xl';
    case 'parchment':
      return 'bg-[#F9F7F1] border border-[#E4DEC9] p-6 rounded-xl shadow-xs';
    case 'terracotta':
      return 'bg-[#FDF6F0] border-l-4 border-[#C86446] border-y border-r border-[#EBDCD3] p-6 rounded-xl';
    case 'forest_fog':
      return 'bg-[#F2F5F3] border border-[#CAD5CD] text-[#203028] p-6 rounded-xl';
    case 'chalk':
      return 'bg-white border border-[#E7E5E0] text-[#1E1E1E] p-6 rounded-xl shadow-xs';
    case 'gold_accent':
      return 'border-l-4 border-amber-600/80 bg-amber-50/20 pl-5 pr-4 py-3 rounded-r-lg';
    case 'dark':
      return 'bg-[#1E1A17] text-[#F7F3EC] p-6 rounded-xl';
    case 'default':
    default:
      return '';
  }
};

export function BlockRenderer({
  blocks,
  className = '',
  interactivePreview = false,
  selectedBlockId,
  onSelectBlock,
}: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderSingleBlock = (block: CmsBlock, wrapperClass: string) => {
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
      case 'map':
        return <MapBlock key={block.id} block={block} className={wrapperClass} />;
      case 'table_of_contents':
        return <TableOfContentsBlock key={block.id} block={block} allBlocks={blocks} className={wrapperClass} />;
      case 'hospitality_spot':
        return <HospitalitySpotBlock key={block.id} block={block} className={wrapperClass} />;
      default:
        return null;
    }
  };

  return (
    <div className={`cms-blocks-container w-full max-w-4xl mx-auto ${className}`}>
      {blocks.map((block) => {
        const spacing = getSpacingClass(block.spacing);
        const theme = getThemeClass(block.theme);
        const wrapperClass = `${spacing} ${theme}`.trim();
        const blockNode = renderSingleBlock(block, wrapperClass);

        if (!interactivePreview) {
          return blockNode;
        }

        const isSelected = selectedBlockId === block.id;

        return (
          <div
            key={block.id}
            id={`render-blk-${block.id}`}
            data-cms-block-id={block.id}
            onClick={() => onSelectBlock?.(block.id)}
            title={block.type}
            className={`relative transition-all duration-200 ${
              isSelected
                ? 'ring-2 ring-amber-500 rounded-sm bg-amber-500/5'
                : 'hover:ring-2 hover:ring-amber-500/60 hover:bg-amber-500/5 rounded-sm'
            } cursor-pointer`}
          >
            {blockNode}
          </div>
        );
      })}
    </div>
  );
}

export default BlockRenderer;
