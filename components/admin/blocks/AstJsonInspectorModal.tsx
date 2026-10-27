'use client';

import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Download, Upload, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';
import type { CmsBlock } from '@/types/cms-blocks';

interface AstJsonInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: CmsBlock[];
  onApplyBlocks?: (newBlocks: CmsBlock[]) => void;
}

export function AstJsonInspectorModal({
  isOpen,
  onClose,
  blocks,
  onApplyBlocks,
}: AstJsonInspectorModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableJson, setEditableJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const jsonString = useMemo(() => {
    return JSON.stringify(blocks, null, 2);
  }, [blocks]);

  const byteSize = useMemo(() => {
    return new Blob([jsonString]).size;
  }, [jsonString]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heldonica_ast_blocks_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartEdit = () => {
    setEditableJson(jsonString);
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editableJson);
      if (!Array.isArray(parsed)) {
        setErrorMsg('Le JSON AST doit être un tableau de blocs (Array).');
        return;
      }
      for (const item of parsed) {
        if (!item || typeof item !== 'object' || !item.id || !item.type) {
          setErrorMsg('Chaque bloc doit posséder un "id" et un "type" valide.');
          return;
        }
      }

      onApplyBlocks?.(parsed as CmsBlock[]);
      setIsEditing(false);
      setErrorMsg(null);
    } catch (err: unknown) {
      setErrorMsg(`Erreur de syntaxe JSON : ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 font-mono">
                  Inspecteur AST JSON (Sanity Killer Engine)
                </h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Portable Blocks v1
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Arbre de structure brut des {blocks.length} bloc{blocks.length > 1 ? 's' : ''} &bull; {(byteSize / 1024).toFixed(1)} Ko
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                  <span>{copied ? 'Copié !' : 'Copier JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs transition-colors"
                  title="Télécharger le fichier .json"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Télécharger</span>
                </button>
                {onApplyBlocks && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modifier AST</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Valider &amp; Appliquer
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors ml-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message d'erreur éventuel */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Corps */}
        <div className="flex-1 overflow-hidden p-4 bg-stone-900 flex flex-col">
          {isEditing ? (
            <textarea
              value={editableJson}
              onChange={(e) => setEditableJson(e.target.value)}
              className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
              autoFocus
            />
          ) : (
            <pre className="flex-1 overflow-auto text-emerald-300 font-mono text-xs leading-relaxed selection:bg-emerald-800 selection:text-white">
              {jsonString}
            </pre>
          )}
        </div>

        {/* Footer métadonnées de conformité */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Arbre Pur TypeScript &bull; Zéro perte bilatérale
            </span>
            <span className="text-stone-400">|</span>
            <span>Commentaire HTML synchronisé automatiquement</span>
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            {blocks.map((b) => b.type).join(' &rarr; ')}
          </span>
        </div>
      </div>
    </div>
  );
}
