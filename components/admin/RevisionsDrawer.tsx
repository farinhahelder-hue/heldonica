'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  X,
  RotateCcw,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from './Toast';
import type { CmsBlock } from '@/types/cms-blocks';
import { htmlToBlocks } from '@/lib/cms-blocks-converter';
import { computeBlockDiff, type BlockDiffSummary } from '@/lib/cms-revisions-diff';

interface RevisionsDrawerProps {
  articleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (restoredArticle: any) => void;
  currentBlocks?: CmsBlock[];
}

interface RevisionItem {
  id: string;
  post_id: string;
  revision_number: number;
  author_id?: string;
  changelog?: string;
  snapshot: any;
  created_at: string;
}

export default function RevisionsDrawer({
  articleId,
  isOpen,
  onClose,
  onRestore,
  currentBlocks = [],
}: RevisionsDrawerProps) {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<RevisionItem | null>(null);
  const [showDetailedDiff, setShowDetailedDiff] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !articleId) return;

    let mounted = true;
    setLoading(true);

    fetch(`/api/cms/articles/${articleId}/revisions`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.revisions && Array.isArray(data.revisions)) {
          setRevisions(data.revisions);
          if (data.revisions.length > 0) {
            setSelectedRevision(data.revisions[0]);
          }
        } else {
          setRevisions([]);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        toast('Impossible de charger les révisions : ' + String(err), 'error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, articleId, toast]);

  // Diff des blocs de la révision sélectionnée par rapport aux blocs actuels
  const diffSummary: BlockDiffSummary | null = useMemo(() => {
    if (!selectedRevision?.snapshot?.content) return null;
    const revBlocks = htmlToBlocks(selectedRevision.snapshot.content);
    return computeBlockDiff(currentBlocks, revBlocks);
  }, [selectedRevision, currentBlocks]);

  if (!isOpen) return null;

  const handleRestore = async (revision: RevisionItem) => {
    if (!articleId) return;
    const confirm = window.confirm(
      `Restaurer la révision n°${revision.revision_number} du ${new Date(revision.created_at).toLocaleString('fr-FR')} ? Une sauvegarde automatique de la version actuelle sera créée avant le rollback.`
    );
    if (!confirm) return;

    setRestoringId(revision.id);
    try {
      const res = await fetch(`/api/cms/articles/${articleId}/revisions/${revision.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoredBy: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la restauration');
      }

      toast(`Révision n°${revision.revision_number} restaurée avec succès !`, 'success');
      onRestore(data.restoredSnapshot);
      onClose();
    } catch (err: any) {
      toast(err?.message || 'Échec du rollback', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-stone-200">
        {/* En-tête */}
        <div className="p-4 px-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <History size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif">Historique des versions & Diff visuel</h2>
              <p className="text-[11px] text-stone-500">Comparateur bloc par bloc et restauration 1-clic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            aria-label="Fermer le comparateur"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin" />
              <span>Chargement des versions archivées…</span>
            </div>
          ) : revisions.length === 0 ? (
            <div className="py-16 text-center text-stone-500 text-xs bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-8">
              <AlertCircle size={28} className="mx-auto text-stone-400 mb-2" />
              <p className="font-semibold text-stone-700">Aucune révision enregistrée pour cet article</p>
              <p className="text-stone-400 mt-1">
                Une révision est archivée automatiquement à chaque publication ou modification majeure.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                const formattedDate = new Date(rev.created_at).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
                          v{rev.revision_number}
                        </span>
                        <span className="text-xs text-stone-700 font-medium flex items-center gap-1">
                          <Clock size={12} className="text-stone-400" />
                          {formattedDate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(rev);
                        }}
                        disabled={restoringId === rev.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
                      >
                        <RotateCcw size={12} />
                        <span>{restoringId === rev.id ? 'Restauration…' : 'Restaurer'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      {rev.changelog && (
                        <p className="italic text-stone-500 font-serif">« {rev.changelog} »</p>
                      )}
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <User size={11} /> Modifié par {rev.author_id || 'Éditeur'}
                      </p>
                    </div>

                    {/* Diff Visuel de Blocs si cette révision est sélectionnée */}
                    {isSelected && diffSummary && (
                      <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2.5">
                        {/* Synthèse des modifications de blocs */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                            <Layers size={13} className="text-amber-800" />
                            Diff visuel des blocs ({diffSummary.totalEntries})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDetailedDiff(!showDetailedDiff);
                            }}
                            className="text-[11px] text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1"
                          >
                            <span>{showDetailedDiff ? 'Replier' : 'Détails'}</span>
                            {showDetailedDiff ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </div>

                        {/* Badges de comptage */}
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                          {diffSummary.addedCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              +{diffSummary.addedCount} à restaurer
                            </span>
                          )}
                          {diffSummary.removedCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              -{diffSummary.removedCount} à retirer
                            </span>
                          )}
                          {diffSummary.modifiedCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              ~{diffSummary.modifiedCount} modifié(s)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                            ={diffSummary.unchangedCount} inchangé(s)
                          </span>
                        </div>

                        {/* Liste détaillée des différences de blocs */}
                        {showDetailedDiff && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
                            {diffSummary.entries.map((entry) => (
                              <div
                                key={entry.id}
                                className={`p-2 rounded-lg text-[11px] border flex items-start gap-2 ${
                                  entry.diffType === 'added'
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : entry.diffType === 'removed'
                                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                                    : entry.diffType === 'modified'
                                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                    : 'bg-stone-50 border-stone-200 text-stone-700'
                                }`}
                              >
                                <span
                                  className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] shrink-0 ${
                                    entry.diffType === 'added'
                                      ? 'bg-emerald-600 text-white'
                                      : entry.diffType === 'removed'
                                      ? 'bg-rose-600 text-white'
                                      : entry.diffType === 'modified'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-stone-300 text-stone-700'
                                  }`}
                                >
                                  {entry.diffType === 'added'
                                    ? '+ RESTAURÉ'
                                    : entry.diffType === 'removed'
                                    ? '- RETIRÉ'
                                    : entry.diffType === 'modified'
                                    ? '~ MODIFIÉ'
                                    : '= IDENTIQUE'}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold truncate">{entry.title}</div>
                                  <div className="text-[10px] text-stone-600 truncate mt-0.5">
                                    {entry.summary}
                                  </div>
                                  {entry.details?.before && entry.details?.after && (
                                    <div className="text-[9px] text-stone-500 mt-1 pl-1 border-l border-amber-300">
                                      <span className="line-through text-rose-700">{entry.details.before}</span>
                                      <span className="mx-1">➔</span>
                                      <span className="font-medium text-emerald-800">{entry.details.after}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/60 flex items-center justify-between text-xs text-stone-500">
          <span>{revisions.length} révision(s) archivée(s)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
