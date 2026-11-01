'use client';

import React from 'react';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import type { CmsBlock } from '@/types/cms-blocks';

interface PreviewPaneProps {
  blocks: CmsBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  className?: string;
}

export function PreviewPane({ blocks, selectedBlockId, onSelectBlock, className }: PreviewPaneProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full border border-stone-200 rounded-xl bg-stone-50/50 ${className}`}>
        <div className="text-stone-300 text-xs font-medium uppercase tracking-wider">Aperçu</div>
        <div className="mt-2 text-[10px] text-stone-400 text-center px-4">
          Aucun bloc pour le moment — ajoutez du contenu à gauche pour voir l’aperçu en direct.
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-stone-200 rounded-xl bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200 bg-stone-50">
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Aperçu en direct
        </span>
        <span className="text-[10px] text-stone-400">{blocks.length} bloc{blocks.length > 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-y-auto p-4 min-h-0">
        <BlockRenderer
          blocks={blocks}
          interactivePreview={true}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
        />
      </div>
    </div>
  );
}

export default PreviewPane;
