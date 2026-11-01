'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, ArrowUp, ArrowDown, Plus, Sparkles, X } from 'lucide-react';
import type { BlockType } from '@/types/cms-blocks';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (type: BlockType) => void;
  blocks: Array<{ id: string; type: BlockType; text?: string; content?: string }>;
  onSelectBlock: (id: string) => void;
}

const BLOCK_PRESETS: Array<{ type: BlockType; label: string; desc: string }> = [
  { type: 'heading', label: 'Titre', desc: 'Titre de section H1 à H4' },
  { type: 'text', label: 'Paragraphe', desc: 'Texte riche (Portable Text)' },
  { type: 'image', label: 'Image', desc: 'Photo avec cadrage et point focal' },
  { type: 'gallery', label: 'Galerie', desc: 'Carrousel ou grille de photos' },
  { type: 'button', label: 'Bouton', desc: 'Appel à l’action / lien' },
  { type: 'list', label: 'Liste', desc: 'Puces, numérotée ou checklist' },
  { type: 'video', label: 'Vidéo', desc: 'YouTube ou fichier local' },
  { type: 'map', label: 'Carte', desc: 'Itinéraire géolocalisé' },
  { type: 'vault_spot', label: 'Pépite Coffre', desc: 'Lieu lié au RAG Heldonica' },
  { type: 'photo_evidence', label: 'Preuve photo', desc: 'Photo + lieu, date, anecdote' },
  { type: 'table_of_contents', label: 'Sommaire', desc: 'Table des matières interactive' },
  { type: 'hospitality_spot', label: 'Hébergement', desc: 'Fiche hôtel / chambre d’hôtes' },
];

export function CommandPalette({ isOpen, onClose, onInsertBlock, blocks, onSelectBlock }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return BLOCK_PRESETS.filter((p) =>
      !q || p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.type.includes(q)
    );
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const preset = filtered[selectedIdx];
        if (preset) {
          onInsertBlock(preset.type);
          onClose();
        }
        return;
      }
    },
    [filtered, selectedIdx, onInsertBlock, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 mx-4 sm:mx-0 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <h3 className="text-sm font-bold text-stone-900">Commandes rapides</h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un bloc… (titre, image, galerie, carte…)"
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {filtered.length === 0 && query && (
              <p className="text-[11px] text-stone-400 mt-1">Aucun bloc trouvé</p>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filtered.map((preset, i) => {
              const isSelected = i === selectedIdx;
              const existing = blocks.find((b) => b.type === preset.type);
              return (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => {
                    onInsertBlock(preset.type);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIdx(i)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-stone-50/50 border border-transparent hover:border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center text-xs">
                      <Plus size={12} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-stone-800">{preset.label}</div>
                      <div className="text-[10px] text-stone-500">{preset.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{preset.type}</span>
                </button>
              );
            })}
          </div>

          {blocks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Aller à un bloc existant</div>
              <div className="space-y-1">
                {blocks.slice(0, 10).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onSelectBlock(b.id);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-stone-300 text-[10px] flex items-center justify-center">
                        {blocks.indexOf(b) + 1}
                      </span>
                      <span className="truncate">{b.text || b.content || b.type}</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{b.type}</span>
                  </button>
                ))}
                {blocks.length > 10 && (
                  <p className="text-[10px] text-stone-400 text-center mt-2">
                    +{blocks.length - 10} autre{blocks.length > 11 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-3 text-[10px] text-stone-400 text-center">
            <kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">⌘ K</kbd>{' '}
            ouvrir •{' '}
            <kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">↑ ↓</kbd>{' '}
            naviguer •{' '}
            <kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">Entrée</kbd>{' '}
            insérer
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
