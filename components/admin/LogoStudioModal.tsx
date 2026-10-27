'use client';

import React, { useState, useMemo } from 'react';
import { X, Download, Copy, Check, Sparkles, Sliders } from 'lucide-react';
import {
  generateLogoSvg,
  generateLogoDataUri,
  type LogoStyle,
  type LogoGeneratorOptions,
} from '@/lib/logo-generator';

interface LogoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLogo?: (logoDataUri: string) => void;
}

const STYLE_OPTIONS: { id: LogoStyle; label: string; desc: string }[] = [
  { id: 'seal_circular', label: 'Sceau Circulaire Officiel', desc: 'Couronne gravée, texte courbé et relief de crête' },
  { id: 'mountain_crest', label: 'Écusson Minéral', desc: 'Blason héraldique sobre avec versants ombrés' },
  { id: 'compass_rose', label: 'Rose des Vents Artisanale', desc: 'Aiguilles cardinales fines et coordonnées GPS' },
  { id: 'minimal_monogram', label: 'Monogramme Typographique', desc: 'Initiale sérif noble entre deux filets d’imprimeur' },
];

const COLOR_PALETTES = [
  { id: 'encre_or', name: 'Encre Carbone & Or', primary: '#241D1A', accent: '#B8860B' },
  { id: 'eucalyptus_cuivre', name: 'Eucalyptus & Cuivre', primary: '#006D77', accent: '#C86446' },
  { id: 'sable_foret', name: 'Vert Forêt & Terre Cuite', primary: '#2D3A2F', accent: '#D47355' },
  { id: 'nuit_ardoise', name: 'Bleu Ardoise & Craie', primary: '#1E293B', accent: '#94A3B8' },
];

export function LogoStudioModal({ isOpen, onClose, onApplyLogo }: LogoStudioModalProps) {
  const [style, setStyle] = useState<LogoStyle>('seal_circular');
  const [brandName, setBrandName] = useState<string>('HELDONICA');
  const [subtitle, setSubtitle] = useState<string>('SLOW TRAVEL • CARNET DE TERRAIN');
  const [coordinates, setCoordinates] = useState<string>('47.01°N • 8.65°E');
  const [year, setYear] = useState<string>('2026');
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const logoOptions: LogoGeneratorOptions = useMemo(
    () => ({
      style,
      brandName: brandName.trim() || 'HELDONICA',
      subtitle: subtitle.trim() || 'SLOW TRAVEL',
      coordinates: coordinates.trim() || '47.01°N • 8.65°E',
      year: year.trim() || '2026',
      primaryColor: selectedPalette.primary,
      accentColor: selectedPalette.accent,
      size: 320,
    }),
    [style, brandName, subtitle, coordinates, year, selectedPalette]
  );

  const svgCode = useMemo(() => generateLogoSvg(logoOptions), [logoOptions]);
  const dataUri = useMemo(() => generateLogoDataUri(logoOptions), [logoOptions]);

  if (!isOpen) return null;

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heldonica-insigne-${style}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleApply = () => {
    onApplyLogo?.(dataUri);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* En-tête */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                <span>Générateur Vectoriel de Sceaux &amp; Logos</span>
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                  Vectoriel SVG pur
                </span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Générez des sceaux d&apos;artisan, monogrammes et écussons minéraux personnalisés.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps : 2 colonnes (Paramètres à gauche, Prévisualisation directe à droite) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
          {/* Colonne gauche : Paramètres */}
          <div className="md:col-span-6 space-y-4 text-xs">
            {/* Choix du style */}
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                Style d&apos;Insigne :
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyle(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      style === opt.id
                        ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/30'
                        : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-semibold text-stone-900 text-xs">{opt.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Champs de texte */}
            <div className="space-y-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nom / Marque :</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Sous-titre / Mention :</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Coordonnées GPS :</label>
                  <input
                    type="text"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Millésime / Année :</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Palette de couleurs */}
            <div>
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                Palette Chromatique :
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setSelectedPalette(pal)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      selectedPalette.id === pal.id
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center -space-x-1 shrink-0">
                      <span className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: pal.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: pal.accent }} />
                    </div>
                    <span className="text-[11px] font-medium text-stone-800 truncate">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite : Prévisualisation direct sur papier vergé */}
          <div className="md:col-span-6 flex flex-col items-center justify-between bg-[#FAF7F2] border border-[#DED5C6] rounded-2xl p-6 min-h-[360px]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-2">
              Aperçu Vectoriel Rendu Direct
            </div>

            <div
              className="w-56 h-56 flex items-center justify-center p-2 transition-transform duration-300 hover:scale-105"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />

            <div className="w-full pt-4 border-t border-[#E2D9C8] flex flex-wrap items-center justify-between gap-2 mt-4">
              <button
                type="button"
                onClick={handleCopySvg}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all shadow-2xs"
              >
                {copied ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                <span>{copied ? 'Copié !' : 'Copier SVG'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all shadow-2xs"
                >
                  <Download size={13} />
                  <span>Télécharger .svg</span>
                </button>

                {onApplyLogo && (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    {applied ? <Check size={13} /> : <Sliders size={13} />}
                    <span>{applied ? 'Appliqué !' : 'Appliquer au site'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
