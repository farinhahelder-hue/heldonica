'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { CmsBlock, DocumentMetadata, BlockType } from '@/types/cms-blocks';
import { createDefaultDocumentMetadata, createDefaultBlock } from '@/types/cms-blocks';
import {
  Search,
  X,
  Menu,
  FileText,
  Link,
  Circle,
  Play,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Command as CommandIcon,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { BlockCanvas } from '@/components/admin/blocks/BlockCanvas';
import { PreviewPane } from '@/components/admin/blocks/PreviewPane';
import { CommandPalette } from '@/components/admin/blocks/CommandPalette';

interface CmsDocumentEditorProps {
  blocks: CmsBlock[];
  onChange: (blocks: CmsBlock[]) => void;
  className?: string;
  initialMetadata?: DocumentMetadata;
  onMetadataChange?: (metadata: DocumentMetadata) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}

export function CmsDocumentEditor({
  blocks,
  onChange,
  className = '',
  initialMetadata,
  onMetadataChange,
  selectedBlockId,
  onSelectBlock,
}: CmsDocumentEditorProps) {
  const [metadata, setMetadata] = useState<DocumentMetadata>(initialMetadata ?? createDefaultDocumentMetadata());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [splitView, setSplitView] = useState(true);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(selectedBlockId ?? null);

  useEffect(() => {
    setInternalSelectedId(selectedBlockId ?? null);
  }, [selectedBlockId]);

  const handleMetadataChange = useCallback(
    (patch: Partial<DocumentMetadata>) => {
      const next = { ...metadata, ...patch };
      setMetadata(next);
      onMetadataChange?.(next);
    },
    [metadata, onMetadataChange]
  );

  const handleCommandPaletteOpen = useCallback(() => setCommandPaletteOpen(true), []);
  const handleCommandPaletteClose = useCallback(() => setCommandPaletteOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const statusColor = (status: DocumentMetadata['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-stone-100 text-stone-700 border border-stone-200';
      case 'review':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className={`relative flex flex-col gap-4 ${className}`}>
      {/* En-tête document : métadonnées Sanity-style */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-stone-200 pb-3 bg-stone-50/60 backdrop-blur sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-amber-700" />
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => handleMetadataChange({ title: e.target.value })}
              placeholder="Titre du carnet…"
              className="text-base font-bold text-stone-900 font-serif bg-transparent border-none focus:ring-0 px-0 sm:px-2 min-w-[200px] sm:min-w-[280px]"
              maxLength={200}
            />
          </div>
          <div className="flex items-center gap-2">
            <Link size={16} className="text-stone-400" />
            <input
              type="text"
              value={metadata.slug}
              onChange={(e) => handleMetadataChange({ slug: e.target.value })}
              placeholder="mon-carnet"
              className="text-xs font-mono text-stone-600 bg-transparent border-none focus:ring-0 px-0 min-w-[140px] max-w-[200px]"
              maxLength={120}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColor(metadata.status)}`}>
              {metadata.status === 'draft' ? 'Brouillon' : metadata.status === 'review' ? 'En révision' : 'Publié'}
            </span>
            <select
              value={metadata.status}
              onChange={(e) => handleMetadataChange({ status: e.target.value as DocumentMetadata['status'] })}
              className="text-xs bg-transparent border-none focus:ring-0 px-1"
            >
              <option value="draft">Brouillon</option>
              <option value="review">En révision</option>
              <option value="published">Publié</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSplitView((v) => !v)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            title={splitView ? 'Plein écran éditeur' : 'Vue partagée'}
          >
            {splitView ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={handleCommandPaletteOpen}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            title="Commandes rapides (⌘K)"
          >
            <CommandIcon size={16} />
          </button>
          <button
            type="button"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Corps : éditeur blocs + preview split-pane */}
      <div className={`flex-1 flex ${splitView ? 'lg:flex-row' : 'flex-col'} gap-4 min-h-[400px]`}>
        {/* Éditeur de blocs (à gauche ou plein écran) */}
        <div className={`flex-1 min-w-0 ${splitView ? 'lg:max-w-[60%]' : ''}`}>
          <BlockCanvas
            blocks={blocks}
            onChange={onChange}
            selectedBlockId={internalSelectedId}
            onSelectBlock={(id) => {
              setInternalSelectedId(id);
              onSelectBlock?.(id);
            }}
          />
        </div>

        {/* Preview en direct (à droite en mode split) */}
        {splitView && (
          <div className="hidden lg:block flex-1 min-w-0">
            <PreviewPane
              blocks={blocks}
              selectedBlockId={internalSelectedId}
              onSelectBlock={(id) => {
                setInternalSelectedId(id);
                onSelectBlock?.(id);
              }}
            />
          </div>
        )}
      </div>

      {/* Preview plein écran quand split désactivé */}
      {!splitView && (
        <div className="flex-1 min-h-[300px] border border-stone-200 rounded-xl bg-stone-50/50">
          <PreviewPane
            blocks={blocks}
            selectedBlockId={internalSelectedId}
            onSelectBlock={(id) => {
              setInternalSelectedId(id);
              onSelectBlock?.(id);
            }}
          />
        </div>
      )}

      {/* Command palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={handleCommandPaletteClose}
        onInsertBlock={(type) => {
          const next = [...blocks, createDefaultBlock(type)];
          onChange(next);
          setCommandPaletteOpen(false);
        }}
        blocks={blocks.map((b) => ({ id: b.id, type: b.type, text: 'text' in b ? b.text : undefined, content: 'content' in b ? b.content : undefined }))}
        onSelectBlock={(id) => {
          setInternalSelectedId(id);
          onSelectBlock?.(id);
          setCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}

export default CmsDocumentEditor;
