'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { CmsBlock, DocumentMetadata, BlockType, DocumentRevision } from '@/types/cms-blocks';
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
import { computeReadingMetrics } from '@/lib/cms-reading-metrics';
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
  const metrics = React.useMemo(() => computeReadingMetrics({ title: metadata.title, blocks }), [metadata.title, blocks]);
  const [showShortcuts, setShowShortcuts] = useState(false);

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
  const handleGenerateSlug = useCallback(() => {
    const slug = metadata.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    handleMetadataChange({ slug });
  }, [metadata.title, handleMetadataChange]);

  const handleCommandPaletteOpen = useCallback(() => setCommandPaletteOpen(true), []);

  const handlePublish = useCallback(() => {
    const revision = {
      id: `rev_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'published' as const,
      title: metadata.title,
      blockCount: blocks.length,
      snapshot: JSON.stringify(blocks),
    };
    const next: DocumentMetadata = {
      ...metadata,
      status: 'published',
      publishedAt: new Date().toISOString(),
      revisions: [...(metadata.revisions || []), revision].slice(-20),
    };
    setMetadata(next);
    onMetadataChange?.(next);
  }, [metadata, blocks, onMetadataChange]);

  const [showRevisions, setShowRevisions] = useState(false);
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
            <button
              type="button"
              onClick={handleGenerateSlug}
              title="Générer le slug depuis le titre"
              className="text-[10px] text-stone-400 hover:text-amber-700 px-1"
            >
              ⚡
            </button>
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
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-stone-500 font-mono">
            <span>{metrics.wordCount} mots</span>
            <span>•</span>
            <span>{metrics.readingTimeFormatted}</span>
          </div>
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
            onClick={() => setShowShortcuts(true)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            title="Raccourcis clavier (?)"
          >
            <span className="text-xs font-bold">?</span>
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
            onClick={handlePublish}
            disabled={metadata.status === 'published'}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
            title="Publier ce carnet (crée une révision)"
          >
            <CheckCircle2 size={14} />
            <span>Publier</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify({ metadata, blocks }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${metadata.slug || 'carnet'}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            title="Exporter le carnet en JSON"
          >
            <span>⬇ JSON</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const parsed = JSON.parse(String(reader.result)) as { metadata?: DocumentMetadata; blocks?: CmsBlock[] };
                    if (parsed.blocks) onChange(parsed.blocks);
                    if (parsed.metadata) {
                      setMetadata(parsed.metadata);
                      onMetadataChange?.(parsed.metadata);
                    }
                  } catch {
                    // ignore
                  }
                };
                reader.readAsText(file);
              };
              input.click();
            }}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            title="Importer un carnet depuis un fichier JSON"
          >
            <span>⬆ JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRevisions((v) => !v)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            title="Historique des révisions"
          >
            <Clock size={14} />
            <span>Révisions ({(metadata.revisions || []).length})</span>
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
      {/* Panneau d'historique des révisions (Content Lake style) */}
      {showRevisions && (
        <div className="border border-stone-200 rounded-xl bg-stone-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-stone-900 font-serif">Historique des révisions</h3>
            <button
              type="button"
              onClick={() => setShowRevisions(false)}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              <X size={16} />
            </button>
          </div>
          {(metadata.revisions || []).length === 0 ? (
            <p className="text-xs text-stone-500 italic">Aucune révision publiée pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {[...(metadata.revisions || [])].reverse().map((rev) => (
                <li
                  key={rev.id}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                >
                  <div>
                    <div className="font-semibold text-stone-800">{rev.title || 'Sans titre'}</div>
                    <div className="text-[10px] text-stone-500">
                      {new Date(rev.createdAt).toLocaleString('fr-FR')} • {rev.blockCount} bloc{rev.blockCount > 1 ? 's' : ''} • {rev.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const snap = JSON.parse(rev.snapshot) as CmsBlock[];
                        onChange(snap);
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-2 py-1 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
                  >
                    Restaurer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Modal raccourcis clavier */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}
        >
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 mx-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-900 font-serif">Raccourcis clavier</h3>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="space-y-2 text-xs text-stone-700">
              <li className="flex justify-between"><span>Ouvrir commandes rapides</span><kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">⌘K</kbd></li>
              <li className="flex justify-between"><span>Annuler</span><kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">⌘Z</kbd></li>
              <li className="flex justify-between"><span>Rétablir</span><kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">⌘⇧Z</kbd></li>
              <li className="flex justify-between"><span>Astuce : sélectionner un bloc pour l'éditer</span><span className="text-stone-400">clic</span></li>
              <li className="flex justify-between"><span>Fermer les modales</span><kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">Esc</kbd></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CmsDocumentEditor;
