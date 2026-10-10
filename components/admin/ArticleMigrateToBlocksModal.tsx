'use client';

import React, { useMemo } from 'react';
import { htmlToBlocks } from '@/lib/cms-blocks-converter';
import type { CmsBlock } from '@/types/cms-blocks';

interface ArticleMigrateToBlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (blocks: CmsBlock[]) => void;
  content: string;
}

export default function ArticleMigrateToBlocksModal({
  isOpen,
  onClose,
  onConfirm,
  content,
}: ArticleMigrateToBlocksModalProps) {
  const blocks = useMemo(() => {
    if (!isOpen || !content) return [];
    return htmlToBlocks(content);
  }, [isOpen, content]);

  const stats = useMemo(() => {
    let headings = 0;
    let texts = 0;
    let images = 0;
    let others = 0;

    blocks.forEach((b) => {
      if (b.type === 'heading') headings++;
      else if (b.type === 'text') texts++;
      else if (b.type === 'image') images++;
      else others++;
    });

    return { headings, texts, images, others, total: blocks.length };
  }, [blocks]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            ✨ Migration vers le Mode Blocs
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            La conversion automatique va découper votre article en {stats.total} blocs modulaires interactifs.
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-center">
              <div className="text-2xl font-bold text-stone-700">{stats.headings}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mt-1">Titres</div>
            </div>
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-center">
              <div className="text-2xl font-bold text-stone-700">{stats.texts}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mt-1">Paragraphes</div>
            </div>
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-center">
              <div className="text-2xl font-bold text-stone-700">{stats.images}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mt-1">Images</div>
            </div>
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-center">
              <div className="text-2xl font-bold text-stone-700">{stats.others}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mt-1">Autres</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
            <strong>Garde-fou :</strong> Une sauvegarde automatique sera créée dans l'historique des révisions avant la validation. Vous pourrez annuler cette action à tout moment via l'onglet Révisions.
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Prévisualisation de la structure :</h3>
            <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 bg-stone-50 overflow-hidden max-h-64 overflow-y-auto">
              {blocks.map((block) => (
                <div key={block.id} className="p-3 flex items-start gap-3 text-sm">
                  <span className="px-2 py-1 bg-stone-200 text-stone-700 text-xs rounded-md font-mono w-24 text-center shrink-0">
                    {block.type}
                  </span>
                  <div className="text-stone-600 line-clamp-2 overflow-hidden flex-1">
                    {block.type === 'heading' && block.text}
                    {block.type === 'text' && block.content}
                    {block.type === 'image' && (block.url || 'Image détectée')}
                    {block.type !== 'heading' && block.type !== 'text' && block.type !== 'image' && 'Contenu spécial'}
                  </div>
                </div>
              ))}
              {blocks.length === 0 && (
                <div className="p-4 text-center text-stone-500 italic">
                  Aucun bloc détecté
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onConfirm(blocks)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2D8B7A] rounded-lg hover:bg-[#256b5e] shadow-sm flex items-center gap-2"
          >
            Confirmer et basculer en Mode Blocs
          </button>
        </div>
      </div>
    </div>
  );
}
