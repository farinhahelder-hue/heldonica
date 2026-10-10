'use client';

import React, { useState, useId, useTransition } from 'react';
import {
  Download,
  Upload,
  FileText,
  FileCode,
  Globe,
  Copy,
  Check,
  AlertTriangle,
  X,
  Sparkles,
  Clock,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import type { CmsBlock } from '@/types/cms-blocks';
import {
  exportArticleToMarkdown,
  exportArticleToJson,
  exportArticleToHtml,
  importArticleFromMarkdown,
  importArticleFromJson,
  triggerFileDownload,
  type ExportArticleInput,
  type ImportedArticle,
  type ImportArticleResult,
} from '@/lib/cms-export-import';
import { computeReadingMetrics } from '@/lib/cms-reading-metrics';

export interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ExportArticleInput;
  blocks: CmsBlock[];
  onImportArticle: (imported: ImportedArticle) => void;
  toast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function ExportImportModal({
  isOpen,
  onClose,
  article,
  blocks,
  onImportArticle,
  toast,
}: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importRawInput, setImportRawInput] = useState('');
  const [importResult, setImportResult] = useState<ImportArticleResult | null>(null);
  const [, startTransition] = useTransition();

  const fileInputId = useId();

  if (!isOpen) return null;

  // Calcul direct des métriques de l'article en cours
  const metrics = computeReadingMetrics({
    title: article.title,
    excerpt: article.excerpt,
    blocks,
    content: article.content,
    season: article.season,
    mobility: article.mobility,
    budget_level: article.budget_level,
    carbon_footprint: article.carbon_footprint,
  });

  const baseFilename = (article.slug || 'article-heldonica')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');

  const handleExportMarkdown = () => {
    const md = exportArticleToMarkdown(article, blocks);
    triggerFileDownload(md, `${baseFilename}.md`, 'text/markdown;charset=utf-8');
    toast?.('Article exporté en Markdown (.md)', 'success');
  };

  const handleExportJson = () => {
    const json = exportArticleToJson(article, blocks);
    triggerFileDownload(json, `${baseFilename}.json`, 'application/json;charset=utf-8');
    toast?.('Article exporté en JSON (.json)', 'success');
  };

  const handleExportHtml = () => {
    const html = exportArticleToHtml(article, blocks);
    triggerFileDownload(html, `${baseFilename}.html`, 'text/html;charset=utf-8');
    toast?.('Archive HTML téléchargée (.html)', 'success');
  };

  const handleCopyMarkdown = async () => {
    const md = exportArticleToMarkdown(article, blocks);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast?.('Markdown copié dans le presse-papier !', 'success');
      }
    } catch {
      toast?.('Impossible de copier dans le presse-papier', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setImportRawInput(text);
      analyzeContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const analyzeContent = (rawText: string, filename?: string) => {
    if (!rawText.trim()) {
      setImportResult(null);
      return;
    }

    startTransition(() => {
      const isJson =
        (filename && filename.endsWith('.json')) ||
        rawText.trim().startsWith('{') ||
        rawText.trim().startsWith('[');

      if (isJson) {
        const res = importArticleFromJson(rawText);
        setImportResult(res);
      } else {
        const res = importArticleFromMarkdown(rawText);
        setImportResult(res);
      }
    });
  };

  const handleApplyImport = () => {
    if (!importResult || !importResult.success || !importResult.article) {
      toast?.('Aucun article valide à charger', 'error');
      return;
    }

    onImportArticle(importResult.article);
    toast?.(`Article « ${importResult.article.title} » chargé dans l'éditeur !`, 'success');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export et Import d'articles"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#C4714A]/10 text-[#C4714A]">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Portabilité & Métriques Slow Travel
              </h2>
              <p className="text-xs text-stone-500">
                Sauvegarde froide, réversibilité 100% sans perte et analyse éditoriale
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Onglets */}
        <div className="flex border-b border-stone-200 px-6 pt-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-[#C4714A] text-[#C4714A]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Download size={16} />
            <span>Exporter l'article</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-[#C4714A] text-[#C4714A]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Upload size={16} />
            <span>Importer un fichier</span>
          </button>
        </div>

        {/* Corps des onglets */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              {/* Carte des métriques slow travel */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#C4714A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      Analyse de lecture attentive
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      metrics.slowScore >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : metrics.slowScore >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Score Slow : {metrics.slowScore} / 100
                  </span>
                </div>

                {/* Chiffres clés */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-stone-200/60 shadow-xs">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
                      <Clock size={13} />
                      <span>Temps estimé</span>
                    </div>
                    <div className="text-sm font-bold text-stone-900">
                      {metrics.readingTimeFormatted}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200/60 shadow-xs">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
                      <FileText size={13} />
                      <span>Volume texte</span>
                    </div>
                    <div className="text-sm font-bold text-stone-900">
                      {metrics.wordCount} mots ({metrics.characterCount} car.)
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200/60 shadow-xs">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
                      <ShieldCheck size={13} />
                      <span>Terrain & Blocs</span>
                    </div>
                    <div className="text-sm font-bold text-stone-900">
                      {metrics.photoEvidenceCount + metrics.vaultSpotCount} preuves · {blocks.length} blocs
                    </div>
                  </div>
                </div>

                {/* Recommandations éventuelles */}
                {metrics.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-stone-200/60">
                    <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle size={13} className="text-amber-600" />
                      Suggestions d'optimisation slow travel :
                    </span>
                    <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
                      {metrics.recommendations.map((rec) => (
                        <li key={rec}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Boutons d'export */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Formats d'exportation réversibles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-200 bg-white hover:border-[#C4714A] hover:bg-amber-50/30 transition-all text-center group shadow-xs"
                  >
                    <FileText size={22} className="text-[#C4714A] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-stone-900">Markdown (.md)</span>
                    <span className="text-xs text-stone-400">Frontmatter + Blocs lossless</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-200 bg-white hover:border-[#2D8B7A] hover:bg-teal-50/30 transition-all text-center group shadow-xs"
                  >
                    <FileCode size={22} className="text-[#2D8B7A] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-stone-900">JSON Heldonica</span>
                    <span className="text-xs text-stone-400">Arbre complet & métadonnées</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportHtml}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 transition-all text-center group shadow-xs"
                  >
                    <Globe size={22} className="text-stone-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-stone-900">Archive HTML</span>
                    <span className="text-xs text-stone-400">Prêt pour lecture autonome</span>
                  </button>
                </div>
              </div>

              {/* Copie rapide presse-papier */}
              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors shadow-2xs"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Markdown copié !' : 'Copier le Markdown dans le presse-papier'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Zone Glisser-Déposer de fichier */}
              <div>
                <label
                  htmlFor={fileInputId}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer bg-stone-50/50 hover:bg-stone-100/70 hover:border-[#C4714A] transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={24} className="text-stone-400 mb-2" />
                    <p className="text-xs font-semibold text-stone-700">
                      Glissez un fichier <span className="font-mono text-[#C4714A]">.md</span> ou{' '}
                      <span className="font-mono text-[#2D8B7A]">.json</span> ici
                    </p>
                    <p className="text-2xs text-stone-400 mt-1">ou cliquez pour parcourir vos fichiers</p>
                  </div>
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".md,.markdown,.json,text/markdown,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Ou saisie directe */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Ou collez directement votre code Markdown / JSON :
                </label>
                <textarea
                  rows={4}
                  value={importRawInput}
                  onChange={(e) => {
                    setImportRawInput(e.target.value);
                    analyzeContent(e.target.value);
                  }}
                  placeholder="---\ntitle: Mon voyage lent\n---\n# Mon récit..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C4714A] resize-y"
                />
              </div>

              {/* Analyse / Validation temps réel */}
              {importResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    importResult.success
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/60 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {importResult.success ? '✓ Contenu valide détecté' : '✗ Erreur d’analyse'} (Format :{' '}
                      {importResult.detectedFormat.toUpperCase()})
                    </span>
                    {importResult.article && (
                      <span className="text-2xs font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                        {importResult.article.blocks.length} blocs reconnus
                      </span>
                    )}
                  </div>

                  {importResult.article && (
                    <div className="space-y-1 text-stone-700 pt-1 border-t border-emerald-200/50">
                      <p>
                        <strong>Titre :</strong> {importResult.article.title}
                      </p>
                      <p>
                        <strong>Slug :</strong> <code className="font-mono">{importResult.article.slug}</code>
                      </p>
                      {importResult.article.season && (
                        <p>
                          <strong>Saison :</strong> {importResult.article.season}
                        </p>
                      )}
                    </div>
                  )}

                  {importResult.warnings && importResult.warnings.length > 0 && (
                    <div className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/60 text-2xs space-y-1">
                      <strong>Avertissements :</strong>
                      <ul className="list-disc list-inside">
                        {importResult.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importResult.errors && (
                    <ul className="text-rose-700 list-disc list-inside">
                      {importResult.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer modal */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            Fermer
          </button>

          {activeTab === 'import' && (
            <button
              type="button"
              disabled={!importResult?.success}
              onClick={handleApplyImport}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-[#C4714A] text-white hover:bg-[#b05f3a] disabled:opacity-50 transition-colors shadow-xs"
            >
              <Check size={14} />
              <span>Charger dans l'éditeur</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
