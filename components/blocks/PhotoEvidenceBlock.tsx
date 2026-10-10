import React from 'react';
import type { PhotoEvidenceBlock as PhotoEvidenceBlockType } from '@/types/cms-blocks';
import { PhotoEvidenceBlock as PhotoEvidencePresentational } from '@/components/PhotoEvidenceBlock';

interface Props {
  block: PhotoEvidenceBlockType;
  className?: string;
}

export function PhotoEvidenceBlock({ block, className = '' }: Props) {
  return (
    <div className={className}>
      <PhotoEvidencePresentational
        imageUrl={block.imageUrl}
        location={block.location}
        date={block.date}
        anecdote={block.anecdote}
        albumLink={block.albumLink}
      />
    </div>
  );
}
