'use client';

import React, { useState, useMemo } from 'react';
import type {
  CmsBlock,
  BlockType,
  TextBlock,
  HeadingBlock,
  ImageBlock,
  GalleryBlock,
  ButtonBlock,
  ListBlock,
  VideoBlock,
  VaultSpotBlock,
  PhotoEvidenceBlock,
  BlockSpacing,
  BlockTheme,
} from '@/types/cms-blocks';
import { createDefaultBlock } from '@/types/cms-blocks';
import {
  Type,
  Heading,
  Image as ImageIcon,
  Images,
  Video,
  MousePointerClick,
  ListOrdered,
  Sparkles,
  Camera,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Settings2,
  PlusCircle,
  X,
  LayoutTemplate,
  Search,
  GripVertical,
  Copy,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Mic,
} from 'lucide-react';
import { VERIFIED_PHOTO_ALBUMS, type PhotoEvidenceItem } from '@/lib/cms-photo-albums';
import { getCmsTemplates, instantiateCmsTemplate, type CmsTemplateId } from '@/lib/cms-templates';
import { searchVaultSpots, getAllVaultSpots, type VaultSpotRecord } from '@/lib/cms-vault-spots';
import { lintCanvasBlocks } from '@/lib/cms-brand-linter';
import { auditCanvasA11y } from '@/lib/cms-a11y';
import PhotoPickerModal, { type SelectedPhotoPayload } from '@/components/admin/media/PhotoPickerModal';
import { PhotoInterviewModal } from '@/components/admin/PhotoInterviewModal';
import { generateBlocksFromAlbum } from '@/lib/cms-draft-from-evidence';
import { generateFaqVerdictBundle } from '@/lib/cms-faq-verdict-generator';

interface BlockCanvasProps {
  blocks: CmsBlock[];
  onChange: (blocks: CmsBlock[]) => void;
  className?: string;
}

const BLOCK_TYPES_CONFIG: { type: BlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'heading', label: 'Titre', icon: Heading, description: 'Titres H1 à H4 avec typographie' },
  { type: 'text', label: 'Paragraphe', icon: Type, description: 'Texte riche ou paragraphes' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Photo responsive et légende' },
  { type: 'gallery', label: 'Galerie / Carrousel', icon: Images, description: 'Diaporama ou grille de photos' },
  { type: 'video', label: 'Vidéo & Shorts', icon: Video, description: 'YouTube, format standard ou 9:16' },
  { type: 'button', label: 'Bouton / Lien', icon: MousePointerClick, description: 'Appel à l action ou lien externe' },
  { type: 'list', label: 'Liste / Checklist', icon: ListOrdered, description: 'Puces, numéros ou checklist voyage' },
  { type: 'vault_spot', label: 'Pépite du Coffre', icon: Sparkles, description: 'Encadré lié au Coffre des Savoirs RAG' },
  { type: 'photo_evidence', label: 'Preuve photo', icon: Camera, description: 'Photo + lieu, date, anecdote et album' },
];

export function BlockCanvas({ blocks, onChange, className = '' }: BlockCanvasProps) {
  const [activeConfigBlockId, setActiveConfigBlockId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false);
  const [showFaqVerdictModal, setShowFaqVerdictModal] = useState<boolean>(false);
  const [faqDestInput, setFaqDestInput] = useState<string>('Stoos, Suisse');
  const [faqSeasonInput, setFaqSeasonInput] = useState<string>('Automne doré');
  const [showLintDetails, setShowLintDetails] = useState<boolean>(false);
  const [showA11yDetails, setShowA11yDetails] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Linter de voix éditoriale temps réel (source de vérité : lib/brand-voice.ts)
  const lintSummary = useMemo(() => lintCanvasBlocks(blocks), [blocks]);

  // Audit d'accessibilité WCAG 2.1 (A11y)
  const a11yReport = useMemo(() => auditCanvasA11y(blocks), [blocks]);

  const handleApplyTemplate = (templateId: CmsTemplateId, mode: 'replace' | 'append') => {
    const newBlocks = instantiateCmsTemplate(templateId);
    if (mode === 'replace') {
      onChange(newBlocks);
    } else {
      onChange([...blocks, ...newBlocks]);
    }
    setShowTemplateModal(false);
  };

  const handleApplyAlbum = (album: any, mode: 'replace' | 'append') => {
    const newBlocks = generateBlocksFromAlbum(album);
    if (mode === 'replace') {
      onChange(newBlocks);
    } else {
      onChange([...blocks, ...newBlocks]);
    }
    setShowAlbumModal(false);
  };

  const handleApplyFaqVerdict = () => {
    const bundle = generateFaqVerdictBundle({
      destination: faqDestInput,
      season: faqSeasonInput,
      mobility: 'mobilités douces et marche',
    });

    const now = Date.now().toString(36);
    const faqBlocks: CmsBlock[] = [
      {
        id: `blk_faq_h2_${now}`,
        type: 'heading',
        level: 2,
        text: `Questions fréquentes & repères pratiques : ${faqDestInput}`,
        subtitle: `Vérifié par nous-mêmes sur le terrain (${faqSeasonInput})`,
      },
      {
        id: `blk_faq_list_${now}`,
        type: 'list',
        style: 'bullet',
        items: bundle.faqs.map((f) => `**${f.question}** — ${f.answer}`),
      },
      {
        id: `blk_verdict_h2_${now}`,
        type: 'heading',
        level: 2,
        text: `Verdict Heldonica sans complaisance`,
        subtitle: `Note de terrain : ${bundle.verdict.verdictScore}/10`,
      },
      {
        id: `blk_verdict_spot_${now}`,
        type: 'vault_spot',
        title: `Le bilan d’Heldonica sur ${faqDestInput}`,
        location: faqDestInput,
        livedExperience: `Moment fort : ${bundle.verdict.highlight} — Piège à éviter : ${bundle.verdict.pitfall} — ${bundle.verdict.recommendation}`,
      },
    ];

    onChange([...blocks, ...faqBlocks]);
    setShowFaqVerdictModal(false);
  };

  // Manipulations de blocs
  const addBlock = (type: BlockType, index?: number) => {
    const newBlock = createDefaultBlock(type);
    if (typeof index === 'number') {
      const updated = [...blocks];
      updated.splice(index + 1, 0, newBlock);
      onChange(updated);
    } else {
      onChange([...blocks, newBlock]);
    }
  };

  const updateBlock = (id: string, partial: Partial<CmsBlock>) => {
    onChange(
      blocks.map((b) => {
        if (b.id !== id) return b;
        return { ...b, ...partial } as CmsBlock;
      })
    );
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const copy = [...blocks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
  };

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const target = blocks[index];
    const newId = `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const clone: CmsBlock = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, clone);
    onChange(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const copy = [...blocks];
    const [moved] = copy.splice(draggedIndex, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
    handleDragEnd();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barre d'outils d'ajout rapide au sommet */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Palette des blocs modulaires
          </span>
          <div className="flex items-center gap-3">
            {/* Linter Voix de Marque Heldonica temps réel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLintDetails((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
                  lintSummary.totalForbidden === 0 && !lintSummary.hasPronounIssues
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
                title="Audit de voix de marque Heldonica en temps réel"
              >
                {lintSummary.totalForbidden === 0 && !lintSummary.hasPronounIssues ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Voix 100% Conforme ({lintSummary.score}/100)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span>
                      {lintSummary.totalForbidden} mot{lintSummary.totalForbidden > 1 ? 's' : ''} banni{lintSummary.totalForbidden > 1 ? 's' : ''}
                      {lintSummary.hasPronounIssues ? ' • Pronoms' : ''} ({lintSummary.score}/100)
                    </span>
                  </>
                )}
              </button>

              {showLintDetails && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-xl p-3.5 z-40 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-amber-600" />
                      Linter Voix Heldonica
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLintDetails(false)}
                      className="text-stone-400 hover:text-stone-600 p-0.5 rounded"
                      aria-label="Fermer"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 mb-2">
                    Score actuel : <strong className="text-stone-700">{lintSummary.score}/100</strong>. Les alertes n'empêchent pas la sauvegarde mais garantissent la tonalité slow travel.
                  </p>

                  {lintSummary.uniqueForbidden.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[11px] font-semibold text-stone-700 mb-1">Mots à remplacer :</div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {lintSummary.suggestions.map((s, i) => (
                          <div key={i} className="flex items-center justify-between bg-stone-50 px-2 py-1 rounded border border-stone-100">
                            <span className="text-rose-600 font-medium">« {s.word} »</span>
                            <span className="text-emerald-700 text-[10px]">→ {s.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lintSummary.hasPronounIssues && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] mt-1">
                      ⚠️ Utiliser « on » pour le duo et « tu » pour le lecteur (aucun « je », « nous », « les voyageurs »).
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Linter Accessibilité WCAG 2.1 (A11y) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowA11yDetails((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
                  a11yReport.isValid
                    ? 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
                title="Audit d'accessibilité WCAG en temps réel"
              >
                {a11yReport.isValid ? (
                  <>
                    <CheckCircle2 size={13} className="text-sky-600" />
                    <span>A11y Conforme ({a11yReport.score}/100)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span>
                      A11y : {a11yReport.errorsCount} alerte{a11yReport.errorsCount > 1 ? 's' : ''} ({a11yReport.score}/100)
                    </span>
                  </>
                )}
              </button>

              {showA11yDetails && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-stone-200 rounded-xl shadow-xl p-3.5 z-40 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-sky-600" />
                      Accessibilité Sémantique (A11y)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowA11yDetails(false)}
                      className="text-stone-400 hover:text-stone-600 p-0.5 rounded"
                      aria-label="Fermer"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 mb-2">
                    Score : <strong className="text-stone-700">{a11yReport.score}/100</strong>. Garantit que vos articles sont lisibles par les lecteurs d'écran et optimisés pour le référencement.
                  </p>

                  {a11yReport.issues.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {a11yReport.issues.map((iss, i) => (
                        <div key={i} className="p-2 bg-stone-50 rounded border border-stone-100 text-[11px]">
                          <div className="font-medium text-amber-900 flex items-center gap-1">
                            <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                            <span>{iss.message}</span>
                          </div>
                          <div className="text-stone-500 text-[10px] mt-0.5 pl-4">{iss.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-emerald-800 text-[11px]">
                      ✓ Toutes les images ont un texte alternatif et la hiérarchie des titres est respectée.
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Choisir un gabarit éditorial préconfiguré"
            >
              <LayoutTemplate size={13} className="text-amber-700" />
              <span>📋 Gabarits Slow Travel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAlbumModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Générer un carnet de route complet à partir d'un album photo de terrain vérifié"
            >
              <Camera size={13} className="text-emerald-700" />
              <span>📷 Album Preuves</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFaqVerdictModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-900 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Générer une FAQ de terrain et un Verdict slow travel sans complaisance"
            >
              <Sparkles size={13} className="text-sky-700" />
              <span>🧭 FAQ & Verdict</span>
            </button>
            <span className="text-xs text-stone-400">
              {blocks.length} bloc{blocks.length > 1 ? 's' : ''} actif{blocks.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {BLOCK_TYPES_CONFIG.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-100 hover:border-amber-300 hover:bg-amber-50/50 text-stone-700 hover:text-amber-900 transition-all text-xs font-medium group"
              title={`Ajouter un bloc ${label}`}
            >
              <Icon size={18} className="mb-1 text-stone-500 group-hover:text-amber-700 transition-colors" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des blocs en cours d'édition */}
      {blocks.length === 0 ? (
        <div className="border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center bg-stone-50/50">
          <PlusCircle size={36} className="mx-auto text-stone-300 mb-3" />
          <h4 className="text-stone-700 font-medium text-base mb-1">Aucun bloc pour le moment</h4>
          <p className="text-stone-500 text-sm max-w-sm mx-auto mb-4">
            Choisissez un type de bloc ci-dessus pour commencer à concevoir votre article visuel sur-mesure.
          </p>
          <button
            type="button"
            onClick={() => addBlock('heading')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
          >
            <Plus size={16} />
            <span>Ajouter un titre</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, idx) => {
            const config = BLOCK_TYPES_CONFIG.find((c) => c.type === block.type) || BLOCK_TYPES_CONFIG[0];
            const Icon = config.icon;
            const isSettingsOpen = activeConfigBlockId === block.id;
            const blockLint = lintSummary.blockResults[block.id];

            return (
              <div
                key={block.id}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
                  draggedIndex === idx
                    ? 'opacity-40 border-dashed border-amber-400 scale-[0.99]'
                    : dragOverIndex === idx
                    ? 'border-amber-400 ring-2 ring-amber-300/50 bg-amber-50/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* En-tête du bloc */}
                <div className="flex items-center justify-between px-4 py-3 bg-stone-50/80 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    {/* Poignée de Drag & Drop */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
                      title="Glisser-déposer pour réorganiser"
                    >
                      <GripVertical size={16} />
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-stone-200/80 text-stone-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <Icon size={16} className="text-amber-800" />
                    <span className="text-xs font-semibold text-stone-800 uppercase tracking-wide">
                      {config.label}
                    </span>
                    {blockLint && !blockLint.isValid && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300"
                        title={blockLint.issues.map((i) => i.message).join(' • ')}
                      >
                        <AlertTriangle size={11} className="text-amber-700" />
                        <span>Voix ({blockLint.issues.length})</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reordering */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBlock(idx, 'up')}
                      aria-label="Monter le bloc"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => moveBlock(idx, 'down')}
                      aria-label="Descendre le bloc"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowDown size={15} />
                    </button>

                    {/* Duplication */}
                    <button
                      type="button"
                      onClick={() => duplicateBlock(block.id)}
                      aria-label="Dupliquer le bloc"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Dupliquer ce bloc"
                    >
                      <Copy size={15} />
                    </button>

                    {/* Settings / Styling toggle */}
                    <button
                      type="button"
                      onClick={() => setActiveConfigBlockId(isSettingsOpen ? null : block.id)}
                      aria-label="Paramètres de style du bloc"
                      className={`p-1 rounded-lg transition-colors ${
                        isSettingsOpen ? 'bg-amber-100 text-amber-900' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Settings2 size={15} />
                    </button>

                    {/* Suppression */}
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      aria-label="Supprimer le bloc"
                      className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors ml-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Alerte linter spécifique au bloc (non bloquante, Option A) */}
                {blockLint && !blockLint.isValid && (
                  <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                    <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      {blockLint.issues.map((iss, i) => (
                        <div key={i} className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-medium">{iss.message}</span>
                          {iss.suggestion && (
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-200 px-1.5 py-0.5 rounded">
                              Suggestion : {iss.suggestion}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paramètres avancés de style si ouvert */}
                {isSettingsOpen && (
                  <div className="p-3 bg-amber-50/40 border-b border-amber-100/60 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <label className="text-stone-600 font-medium">Espacement :</label>
                      <select
                        value={block.spacing || 'normal'}
                        onChange={(e) => updateBlock(block.id, { spacing: e.target.value as BlockSpacing })}
                        className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="relaxed">Aéré (Relaxed)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-stone-600 font-medium">Thème :</label>
                      <select
                        value={block.theme || 'default'}
                        onChange={(e) => updateBlock(block.id, { theme: e.target.value as BlockTheme })}
                        className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700"
                      >
                        <option value="default">Standard</option>
                        <option value="sand">Fond Sable clair</option>
                        <option value="gold_accent">Accent Doré latéral</option>
                        <option value="dark">Fond Sombre</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Corps d'édition spécifique par type */}
                <div className="p-4">
                  {block.type === 'heading' && (
                    <HeadingEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'text' && (
                    <TextEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'image' && (
                    <ImageEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'gallery' && (
                    <GalleryEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'video' && (
                    <VideoEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'button' && (
                    <ButtonEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'list' && (
                    <ListEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'vault_spot' && (
                    <VaultSpotEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                  {block.type === 'photo_evidence' && (
                    <PhotoEvidenceEditor block={block} onUpdate={(p) => updateBlock(block.id, p)} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Bouton d'ajout rapide en fin de liste */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => addBlock('text')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 rounded-xl text-stone-700 hover:text-amber-900 text-xs font-medium transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Insérer un nouveau bloc à la suite</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de sélection de Gabarit Slow Travel */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <LayoutTemplate size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">Gabarits Éditoriaux Slow Travel</h3>
                  <p className="text-xs text-stone-500">Initiez un carnet ou une fiche de caractère en un clic</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCmsTemplates().map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-stone-900">{tpl.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                        ~{tpl.estimatedReadingMinutes} min
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mb-3 leading-relaxed">{tpl.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl.id, 'replace')}
                      className="flex-1 py-1.5 px-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-colors text-center"
                    >
                      Remplacer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl.id, 'append')}
                      className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors text-center"
                    >
                      Ajouter à la suite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection d'Album de Preuves de Terrain */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">Albums & Preuves Réelles du Duo</h3>
                  <p className="text-xs text-stone-500">Générez un carnet complet (Photos, Anecdotes, FAQ & Verdict) en 1 clic</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAlbumModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {VERIFIED_PHOTO_ALBUMS.map((album) => (
                <div
                  key={album.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 truncate">{album.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                        <span>📅 {album.period}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">📸 {album.photos.length} photos vérifiées</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleApplyAlbum(album, 'replace')}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-colors text-center"
                    >
                      Remplacer tout
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAlbum(album, 'append')}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-medium transition-colors text-center"
                    >
                      Ajouter à la suite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Générateur FAQ & Verdict de Terrain */}
      {showFaqVerdictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">Générateur FAQ & Verdict</h3>
                  <p className="text-xs text-stone-500">Repères concrets sans blabla et verdict sans complaisance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFaqVerdictModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Destination / Territoire :</label>
                <input
                  type="text"
                  value={faqDestInput}
                  onChange={(e) => setFaqDestInput(e.target.value)}
                  placeholder="Ex: Stoos (Suisse), Podgorica, Maramureș..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-sky-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {['Stoos, Suisse', 'Podgorica, Monténégro', 'Maramureș, Roumanie', 'Madère'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFaqDestInput(d)}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-sky-100 text-stone-700 text-[10px] transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Saison ou ambiance vécue :</label>
                <input
                  type="text"
                  value={faqSeasonInput}
                  onChange={(e) => setFaqSeasonInput(e.target.value)}
                  placeholder="Ex: Automne doré, Printemps calme, Hors-saison..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-sky-900 text-[11px] space-y-1">
                <div>✓ 3 questions pratiques (heures sans foule, mobilités douces, animaux/sentiers).</div>
                <div>✓ Verdict Heldonica noté sur 10 avec moment fort et piège à éviter.</div>
                <div>✓ 100% conforme à la charte éditoriale (0 mot banni).</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowFaqVerdictModal(false)}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleApplyFaqVerdict}
                  className="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={14} />
                  <span>Insérer les blocs dans l'article</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Éditeurs individuels de sous-blocs
// -------------------------------------------------------------

function HeadingEditor({ block, onUpdate }: { block: HeadingBlock; onUpdate: (p: Partial<HeadingBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          value={block.level}
          onChange={(e) => onUpdate({ level: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700"
        >
          <option value={1}>H1 - Titre principal</option>
          <option value={2}>H2 - Titre de section</option>
          <option value={3}>H3 - Sous-titre</option>
          <option value={4}>H4 - Petit titre</option>
        </select>
        <input
          type="text"
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Texte du titre..."
          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <input
        type="text"
        value={block.subtitle || ''}
        onChange={(e) => onUpdate({ subtitle: e.target.value })}
        placeholder="Sous-titre optionnel (italique)..."
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-600 italic focus:bg-white focus:outline-none"
      />
    </div>
  );
}

function TextEditor({ block, onUpdate }: { block: TextBlock; onUpdate: (p: Partial<TextBlock>) => void }) {
  return (
    <div>
      <textarea
        rows={4}
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Écrivez votre paragraphe de carnet de voyage..."
        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-y font-sans"
      />
    </div>
  );
}

function ImageEditor({ block, onUpdate }: { block: ImageBlock; onUpdate: (p: Partial<ImageBlock>) => void }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  const handleSelectPhoto = (photo: SelectedPhotoPayload) => {
    onUpdate({
      url: photo.url,
      alt: photo.alt || photo.location || 'Cliché de terrain',
      caption: photo.caption || block.caption || '',
    });
    setIsPickerOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Barre d'action avec sélecteur d'albums réels */}
      <div className="flex items-center justify-between pb-1 border-b border-stone-100">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          Média Image Réelle
        </span>
        <div className="flex items-center gap-2">
          {block.url && (
            <button
              type="button"
              onClick={() => setIsInterviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs"
            >
              <Mic size={12} />
              <span>🎙️ Interviewer (Questions IA)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors shadow-2xs"
          >
            <Camera size={12} />
            <span>📸 Choisir depuis un album de terrain</span>
          </button>
        </div>
      </div>

      {/* Aperçu direct si URL présente */}
      {block.url && (
        <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.url} alt={block.alt || 'Aperçu'} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-semibold text-stone-800 truncate">{block.alt || 'Image sans description'}</div>
            {block.caption && <p className="text-stone-500 text-[11px] truncate italic">{block.caption}</p>}
          </div>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="text-[11px] text-teal-700 hover:text-teal-900 font-medium px-2 py-1 rounded bg-teal-50"
          >
            Changer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="URL de l'image (Supabase Storage, CDN...)"
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none"
        />
        <input
          type="text"
          value={block.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Description alternative (Alt text pour accessibilité)"
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Légende sous la photo..."
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-600 focus:bg-white focus:outline-none"
        />
        <select
          value={block.layout || 'wide'}
          onChange={(e) => onUpdate({ layout: e.target.value as 'inline' | 'wide' | 'fullwidth' })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700"
        >
          <option value="inline">Largeur normale (centrée)</option>
          <option value="wide">Large (Recommandé)</option>
          <option value="fullwidth">Pleine largeur (Fullwidth)</option>
        </select>
        <select
          value={block.aspectRatio || '16:9'}
          onChange={(e) => onUpdate({ aspectRatio: e.target.value as '16:9' | '4:3' | '1:1' | 'auto' })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700"
        >
          <option value="16:9">Format Paysage 16:9</option>
          <option value="4:3">Format Photo 4:3</option>
          <option value="1:1">Format Carré 1:1</option>
          <option value="auto">Format Naturel</option>
        </select>
      </div>

      <PhotoPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectPhoto}
        title="Sélectionner une photo certifiée pour le bloc Image"
      />

      <PhotoInterviewModal
        isOpen={isInterviewOpen}
        onClose={() => setIsInterviewOpen(false)}
        imageUrl={block.url}
        initialLocation={block.alt}
        onApply={(res) => {
          onUpdate({
            caption: res.anecdote,
            alt: res.location || block.alt,
          });
        }}
      />
    </div>
  );
}

function GalleryEditor({ block, onUpdate }: { block: GalleryBlock; onUpdate: (p: Partial<GalleryBlock>) => void }) {
  const [pickerTarget, setPickerTarget] = useState<number | 'new' | null>(null);

  const addImage = () => {
    const images = [...(block.images || []), { url: '', alt: '', caption: '' }];
    onUpdate({ images });
  };

  const updateImage = (index: number, partial: { url?: string; alt?: string; caption?: string }) => {
    const images = (block.images || []).map((img, i) => (i === index ? { ...img, ...partial } : img));
    onUpdate({ images });
  };

  const removeImage = (index: number) => {
    const images = (block.images || []).filter((_, i) => i !== index);
    onUpdate({ images });
  };

  const handleSelectPhoto = (photo: SelectedPhotoPayload) => {
    if (pickerTarget === 'new') {
      const images = [
        ...(block.images || []),
        { url: photo.url, alt: photo.alt, caption: photo.caption || '' },
      ];
      onUpdate({ images });
    } else if (typeof pickerTarget === 'number') {
      updateImage(pickerTarget, {
        url: photo.url,
        alt: photo.alt,
        caption: photo.caption || '',
      });
    }
    setPickerTarget(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select
          value={block.displayMode}
          onChange={(e) => onUpdate({ displayMode: e.target.value as 'carousel' | 'grid_2' | 'grid_3' })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-700 font-medium"
        >
          <option value="carousel">Carrousel interactif (diaporama)</option>
          <option value="grid_2">Grille 2 colonnes</option>
          <option value="grid_3">Grille 3 colonnes</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPickerTarget('new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-medium transition-colors"
          >
            <Camera size={13} />
            <span>📸 Album de terrain</span>
          </button>
          <button
            type="button"
            onClick={addImage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-medium transition-colors"
          >
            <Plus size={13} />
            <span>Ajouter une URL</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {(block.images || []).map((img, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-100">
            {img.url ? (
              <div className="w-10 h-8 rounded overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
              </div>
            ) : null}
            <input
              type="text"
              value={img.url}
              onChange={(e) => updateImage(idx, { url: e.target.value })}
              placeholder="URL de l'image..."
              className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800"
            />
            <input
              type="text"
              value={img.alt || ''}
              onChange={(e) => updateImage(idx, { alt: e.target.value })}
              placeholder="Alt..."
              className="w-28 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-600"
            />
            <input
              type="text"
              value={img.caption || ''}
              onChange={(e) => updateImage(idx, { caption: e.target.value })}
              placeholder="Légende..."
              className="w-36 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-600"
            />
            <button
              type="button"
              onClick={() => setPickerTarget(idx)}
              title="Choisir depuis un album"
              className="text-teal-700 hover:text-teal-900 p-1 text-xs font-medium"
            >
              <Camera size={14} />
            </button>
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="text-stone-400 hover:text-rose-600 p-1"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <PhotoPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectPhoto}
        title="Sélectionner une photo pour la galerie"
      />
    </div>
  );
}

function VideoEditor({ block, onUpdate }: { block: VideoBlock; onUpdate: (p: Partial<VideoBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="Lien YouTube ou URL MP4..."
          className="md:col-span-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none"
        />
        <select
          value={block.aspectRatio}
          onChange={(e) => onUpdate({ aspectRatio: e.target.value as '16:9' | '9:16' })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700"
        >
          <option value="16:9">Format Standard Paysage (16:9)</option>
          <option value="9:16">Format Vertical Shorts / Reels (9:16)</option>
        </select>
      </div>
      <input
        type="text"
        value={block.caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Légende sous la vidéo..."
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-600 focus:bg-white focus:outline-none"
      />
    </div>
  );
}

function ButtonEditor({ block, onUpdate }: { block: ButtonBlock; onUpdate: (p: Partial<ButtonBlock>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        type="text"
        value={block.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Texte du bouton..."
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium focus:bg-white focus:outline-none"
      />
      <input
        type="text"
        value={block.url}
        onChange={(e) => onUpdate({ url: e.target.value })}
        placeholder="Lien URL de redirection (/guide, https://...)"
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:bg-white focus:outline-none"
      />
      <select
        value={block.variant}
        onChange={(e) => onUpdate({ variant: e.target.value as 'primary_gold' | 'outline' | 'subtle' })}
        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700"
      >
        <option value="primary_gold">Bouton Doré / Terracotta</option>
        <option value="outline">Bouton Contour noir</option>
        <option value="subtle">Bouton Discret gris</option>
      </select>
    </div>
  );
}

function ListEditor({ block, onUpdate }: { block: ListBlock; onUpdate: (p: Partial<ListBlock>) => void }) {
  const addItem = () => {
    onUpdate({ items: [...(block.items || []), 'Nouvel élément'] });
  };

  const updateItem = (index: number, text: string) => {
    const items = (block.items || []).map((it, i) => (i === index ? text : it));
    onUpdate({ items });
  };

  const removeItem = (index: number) => {
    onUpdate({ items: (block.items || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <select
          value={block.style}
          onChange={(e) => onUpdate({ style: e.target.value as 'bullet' | 'numbered' | 'checklist' })}
          className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-700 font-medium"
        >
          <option value="bullet">Liste à puces simple</option>
          <option value="numbered">Liste numérotée (étapes)</option>
          <option value="checklist">Checklist voyage (avec cases à cocher)</option>
        </select>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-medium transition-colors"
        >
          <Plus size={13} />
          <span>Ajouter une ligne</span>
        </button>
      </div>

      <div className="space-y-2">
        {(block.items || []).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono w-4 text-right">{idx + 1}.</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-stone-400 hover:text-rose-600 p-1"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VaultSpotEditor({
  block,
  onUpdate,
}: {
  block: VaultSpotBlock;
  onUpdate: (p: Partial<VaultSpotBlock>) => void;
}) {
  const [isVaultPickerOpen, setIsVaultPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpots = searchQuery
    ? searchVaultSpots(searchQuery, { limit: 6 })
    : getAllVaultSpots().slice(0, 6);

  const handleSelectSpot = (spot: VaultSpotRecord) => {
    onUpdate({
      spotId: spot.id,
      title: spot.title,
      location: spot.location || 'Lieu authentique',
      livedExperience: spot.livedExperience,
    });
    setIsVaultPickerOpen(false);
  };

  return (
    <div className="space-y-3 bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/50">
      {/* Barre d'action avec déclencheur Coffre des Savoirs */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-800" />
          <span className="text-xs font-semibold text-amber-950">Pépite du Coffre des Savoirs RAG</span>
          {block.spotId && (
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
              {block.spotId}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsVaultPickerOpen(!isVaultPickerOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors shadow-2xs"
        >
          <Search size={12} />
          <span>{isVaultPickerOpen ? 'Fermer le Coffre' : '🔍 Piocher dans le Coffre'}</span>
        </button>
      </div>

      {/* Panneau de sélection parmi les 78 fiches du Coffre */}
      {isVaultPickerOpen && (
        <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par destination ou mot-clé (ex: Madère, Monténégro, café, levada)..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                Effacer
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => handleSelectSpot(spot)}
                className="p-2.5 rounded-lg border border-stone-100 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer transition-all text-left"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-stone-900 truncate">{spot.title}</span>
                  <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded shrink-0">
                    {spot.location || spot.category}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2 italic leading-relaxed">
                  « {spot.livedExperience} »
                </p>
              </div>
            ))}
            {filteredSpots.length === 0 && (
              <div className="col-span-2 text-center py-4 text-xs text-stone-400">
                Aucune fiche trouvée pour "{searchQuery}". Règle n°1 : on n'invente rien.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Champs éditables avec pré-remplissage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={block.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Nom de la pépite (ex: Café de Ponta do Sol)..."
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-semibold focus:outline-none focus:border-amber-500"
        />
        <input
          type="text"
          value={block.location}
          onChange={(e) => onUpdate({ location: e.target.value })}
          placeholder="Localisation géographique (ex: Madère, Côte Sud)..."
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
        />
      </div>
      <textarea
        rows={2}
        value={block.livedExperience}
        onChange={(e) => onUpdate({ livedExperience: e.target.value })}
        placeholder="Anecdote authentique vécue par le duo (règle Heldonica : pas d'invention)..."
        className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 italic leading-relaxed focus:outline-none focus:border-amber-500"
      />
    </div>
  );
}

function PhotoEvidenceEditor({
  block,
  onUpdate,
}: {
  block: PhotoEvidenceBlock;
  onUpdate: (p: Partial<PhotoEvidenceBlock>) => void;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('montenegro-podgorica-2026');
  const anecdoteLen = block.anecdote?.length ?? 0;

  const currentAlbum = VERIFIED_PHOTO_ALBUMS.find((a) => a.id === selectedAlbumId) ?? VERIFIED_PHOTO_ALBUMS[0];

  const handleSelectPhoto = (photo: PhotoEvidenceItem) => {
    onUpdate({
      imageUrl: photo.imageUrl,
      location: photo.location,
      date: photo.date,
      anecdote: photo.suggestedAnecdote,
      albumLink: photo.albumLink,
    });
    setIsPickerOpen(false);
  };

  return (
    <div className="space-y-3 bg-teal-50/40 p-3.5 rounded-xl border border-teal-200/60">
      {/* Barre d'action avec sélecteur d'albums */}
      <div className="flex items-center justify-between pb-2 border-b border-teal-100">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-teal-700" />
          <span className="text-xs font-semibold text-teal-900">Preuve Photo Réelle & Vécu</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInterviewOpen(true)}
            disabled={!block.imageUrl}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg transition-colors shadow-xs"
          >
            <Mic size={13} />
            <span>🎙️ Interviewer (Questions IA)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-xs"
          >
            <FolderOpen size={13} />
            <span>{isPickerOpen ? 'Fermer les albums' : 'Choisir depuis un album vérifié'}</span>
          </button>
        </div>
      </div>

      {/* Tiroir d'albums réels certifiés */}
      {isPickerOpen && (
        <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              Albums de terrain du duo ({VERIFIED_PHOTO_ALBUMS.length})
            </span>
            <span className="text-[11px] text-teal-700 font-medium">Règle #1 : 100% vécues</span>
          </div>

          {/* Onglets d'albums */}
          <div className="flex flex-wrap gap-1.5">
            {VERIFIED_PHOTO_ALBUMS.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbumId(album.id)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  selectedAlbumId === album.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {album.title.split('—')[0].trim()} ({album.photos.length})
              </button>
            ))}
          </div>

          {/* Grille de photos de l'album sélectionné */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 max-h-60 overflow-y-auto">
            {currentAlbum.photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => handleSelectPhoto(photo)}
                className="group cursor-pointer border border-stone-200 hover:border-teal-500 rounded-lg overflow-hidden bg-stone-50 hover:bg-teal-50/30 transition-all text-left flex flex-col"
              >
                <div className="relative aspect-video bg-stone-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.location}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-mono">
                    {photo.date}
                  </span>
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-stone-800 truncate">
                    📍 {photo.location}
                  </div>
                  <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 italic">
                    {photo.suggestedAnecdote}
                  </p>
                  <button
                    type="button"
                    className="mt-2 w-full py-1 bg-teal-100 hover:bg-teal-600 hover:text-white text-teal-800 rounded text-[10px] font-semibold transition-colors text-center"
                  >
                    Insérer cette preuve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aperçu visuel direct si imageUrl renseignée */}
      {block.imageUrl && (
        <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.imageUrl} alt={block.location || 'Photo'} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-semibold text-stone-800 truncate flex items-center gap-1.5">
              <span>📍 {block.location || 'Lieu non spécifié'}</span>
              {block.date && <span className="text-stone-400 font-normal">({block.date})</span>}
            </div>
            <div className="text-[11px] text-stone-500 truncate italic">
              {block.anecdote || 'Aucune anecdote rédigée'}
            </div>
          </div>
        </div>
      )}

      {/* Champs d'édition */}
      <input
        type="url"
        value={block.imageUrl}
        onChange={(e) => onUpdate({ imageUrl: e.target.value })}
        placeholder="URL HTTPS de la photo (Supabase Storage ou CDN)..."
        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-teal-500"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={block.location}
          onChange={(e) => onUpdate({ location: e.target.value })}
          placeholder="Lieu exact vécu (ex: Madère, Ponta do Sol)..."
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-teal-500"
        />
        <input
          type="date"
          value={block.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-teal-500"
        />
      </div>
      <textarea
        rows={2}
        value={block.anecdote}
        maxLength={200}
        onChange={(e) => onUpdate({ anecdote: e.target.value })}
        placeholder="Anecdote vécue, max 200 caractères (pas d'invention)..."
        className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 italic leading-relaxed focus:outline-none focus:border-teal-500"
      />
      <div className="flex items-center justify-between gap-3">
        <input
          type="url"
          value={block.albumLink ?? ''}
          onChange={(e) => onUpdate({ albumLink: e.target.value })}
          placeholder="Lien album Google Photos (optionnel, HTTPS)..."
          className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-teal-500"
        />
        <span className={`text-[11px] tabular-nums ${anecdoteLen > 200 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
          {anecdoteLen}/200
        </span>
      </div>

      <PhotoInterviewModal
        isOpen={isInterviewOpen}
        onClose={() => setIsInterviewOpen(false)}
        imageUrl={block.imageUrl}
        initialLocation={block.location}
        initialDate={block.date}
        onApply={(res) => {
          onUpdate({
            anecdote: res.anecdote,
            location: res.location || block.location,
          });
        }}
      />
    </div>
  );
}

export default BlockCanvas;
