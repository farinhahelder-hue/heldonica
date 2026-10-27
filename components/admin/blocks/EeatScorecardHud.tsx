'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Camera,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Globe2,
} from 'lucide-react';
import { computeReadingMetrics } from '@/lib/cms-reading-metrics';
import type { CmsBlock } from '@/types/cms-blocks';

interface EeatScorecardHudProps {
  blocks: CmsBlock[];
}

export function EeatScorecardHud({ blocks }: EeatScorecardHudProps) {
  const [isOpen, setIsOpen] = useState(false);

  const metrics = useMemo(() => {
    return computeReadingMetrics({ blocks });
  }, [blocks]);

  const hasForbidden = metrics.detectedForbiddenWords.length > 0;
  const isExcellent = metrics.slowScore >= 80 && !hasForbidden;

  return (
    <div className="relative inline-block text-left">
      {/* Pillule déclencheur compacte */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Ouvrir le Scorecard E-E-A-T & Slow Travel"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-all ${
          hasForbidden
            ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100'
            : isExcellent
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
            : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
        }`}
        title="Ouvrir le Scorecard E-E-A-T & Slow Travel"
      >
        <ShieldCheck
          className={`w-3.5 h-3.5 ${
            hasForbidden ? 'text-rose-600' : isExcellent ? 'text-emerald-700' : 'text-stone-500'
          }`}
        />
        <span className="font-mono">
          Score Slow : {metrics.slowScore}/100
        </span>
        <span className="text-stone-300">|</span>
        <span className="text-[11px] font-normal text-stone-600">
          {metrics.readingTimeFormatted}
        </span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Popover détaillé E-E-A-T */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-stone-200 shadow-xl p-4 z-50 text-xs animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h4 className="font-bold text-stone-900 font-serif flex items-center gap-1.5 text-sm">
                <span>Scorecard E-E-A-T &amp; Vérité Terrain</span>
              </h4>
              <p className="text-[11px] text-stone-500">
                Garantie zéro hallucination &amp; slow travel intransigeant
              </p>
            </div>
            <span
              className={`font-mono text-sm font-bold px-2 py-0.5 rounded-full ${
                isExcellent
                  ? 'bg-emerald-100 text-emerald-900'
                  : hasForbidden
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {metrics.slowScore}/100
            </span>
          </div>

          <div className="py-3 space-y-2.5">
            {/* Voix de marque */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Pureté Voix de Marque :
              </span>
              {hasForbidden ? (
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {metrics.detectedForbiddenWords.length} mot(s) banni(s)
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">100% Conforme</span>
              )}
            </div>

            {hasForbidden && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800">
                Mots détectés à remplacer : {metrics.detectedForbiddenWords.join(', ')}.
              </div>
            )}

            {/* Preuves photos de terrain */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                <Camera className="w-3.5 h-3.5 text-stone-600" />
                Preuves de terrain vérifiées :
              </span>
              <span className="font-semibold text-stone-900">
                {metrics.photoEvidenceCount} bloc(s) cartographié(s)
              </span>
            </div>

            {/* Pépites du coffre RAG */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                Pépites RAG du Coffre (116 fiches) :
              </span>
              <span className="font-semibold text-stone-900">
                {metrics.vaultSpotCount} pépite(s)
              </span>
            </div>

            {/* Temps de lecture */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-600" />
                Rythme de lecture attentive :
              </span>
              <span className="font-semibold text-stone-900 capitalize">
                {metrics.readingPace.replace('_', ' ')} ({metrics.readingTimeFormatted})
              </span>
            </div>
          </div>

          {/* Recommandations */}
          {metrics.recommendations.length > 0 && (
            <div className="pt-2 border-t border-stone-100">
              <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">
                Conseils Slow Travel :
              </p>
              <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                {metrics.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
