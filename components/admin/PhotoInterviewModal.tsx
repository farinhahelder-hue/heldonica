'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  Check,
  AlertCircle,
  X,
  Compass,
  Calendar,
  Volume2,
  Euro,
  ThumbsDown,
} from 'lucide-react';
import {
  generatePhotoInterviewQuestions,
  synthesizePhotoInterview,
  type PhotoInterviewQuestions,
  type PhotoInterviewSynthesis,
} from '@/lib/cms-photo-interview';

interface PhotoInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialLocation?: string;
  initialDate?: string;
  onApply: (result: {
    anecdote: string;
    richParagraph: string;
    location: string;
  }) => void;
}

export function PhotoInterviewModal({
  isOpen,
  onClose,
  imageUrl,
  initialLocation = '',
  initialDate = '',
  onApply,
}: PhotoInterviewModalProps) {
  const [location, setLocation] = useState(initialLocation);
  const [date, setDate] = useState(initialDate);
  const [questionsData, setQuestionsData] = useState<PhotoInterviewQuestions | null>(null);

  // Réponses saisies par le fondateur
  const [sensoryAnswer, setSensoryAnswer] = useState('');
  const [concreteAnswer, setConcreteAnswer] = useState('');
  const [counterpointAnswer, setCounterpointAnswer] = useState('');

  // Synthèse calculée
  const [synthesis, setSynthesis] = useState<PhotoInterviewSynthesis | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    if (isOpen && imageUrl) {
      setLocation(initialLocation);
      setDate(initialDate);
      const q = generatePhotoInterviewQuestions({
        imageUrl,
        location: initialLocation,
        date: initialDate,
      });
      setQuestionsData(q);
      setSensoryAnswer('');
      setConcreteAnswer('');
      setCounterpointAnswer('');
      setSynthesis(null);
    }
  }, [isOpen, imageUrl, initialLocation, initialDate]);

  if (!isOpen) return null;

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    try {
      const syn = synthesizePhotoInterview(
        {
          sensory: sensoryAnswer,
          concrete: concreteAnswer,
          counterpoint: counterpointAnswer,
        },
        { location, date, imageUrl }
      );
      setSynthesis(syn);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleApply = () => {
    if (!synthesis) return;
    onApply({
      anecdote: synthesis.anecdote,
      richParagraph: synthesis.richParagraph,
      location: location.trim(),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 id="interview-modal-title" className="text-lg font-serif font-bold text-stone-100">
                Interview de Terrain • Enrichissement Vaste & Vrai
              </h2>
              <p className="text-xs text-stone-400">
                On n'invente rien : répondez en quelques mots pour ancrer la photo dans la mémoire réelle.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le modal d'interview"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps modal en split-screen */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne Gauche : L'Image et les Faits Durs */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
              <img
                src={imageUrl}
                alt="Photo de terrain à interviewer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Repères factuels vérifiés */}
            <div className="bg-stone-950/40 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                Repères Factuels
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Lieu constaté :</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Stoos, Schwyz"
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Date vérifiée :</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {questionsData?.visualClues && (
                <div className="pt-2 border-t border-stone-800/80">
                  <div className="text-[11px] text-stone-400 mb-1.5">Indices visuels relevés :</div>
                  <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
                    {questionsData.visualClues.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Colonne Droite : L'Interview en 3 Questions */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Les 3 Questions de Terrain
            </div>

            {/* Q1: Sensation */}
            <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <label className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                1. Sons, odeurs et atmosphère
              </label>
              <p className="text-[11px] text-stone-400">
                {questionsData?.questions.sensory}
              </p>
              <textarea
                value={sensoryAnswer}
                onChange={(e) => setSensoryAnswer(e.target.value)}
                placeholder="Ex: Silence d'alpage absolu, odeur d'herbe chaude et tintement lointain des cloches de vaches."
                rows={2}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Q2: Concret */}
            <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <label className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-amber-400" />
                2. Repère concret & Prix réel
              </label>
              <p className="text-[11px] text-stone-400">
                {questionsData?.questions.concrete}
              </p>
              <textarea
                value={concreteAnswer}
                onChange={(e) => setConcreteAnswer(e.target.value)}
                placeholder="Ex: Funiculaire à 22 CHF après 16h, pente raide sur gravier calcaire, 0 point d'eau sur la crête."
                rows={2}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Q3: Contrepoint */}
            <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
              <label className="text-xs font-medium text-stone-200 flex items-center gap-1.5">
                <ThumbsDown className="w-3.5 h-3.5 text-amber-400" />
                3. Ce qu'on a moins aimé (honnêteté)
              </label>
              <p className="text-[11px] text-stone-400">
                {questionsData?.questions.counterpoint}
              </p>
              <textarea
                value={counterpointAnswer}
                onChange={(e) => setCounterpointAnswer(e.target.value)}
                placeholder="Ex: L'attente au parking de vallée sous 33°C avec le goudron brûlant pour les pattes du chien."
                rows={2}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Bouton de tissage */}
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing || (!sensoryAnswer && !concreteAnswer)}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/10"
            >
              <Sparkles className="w-4 h-4" />
              {isSynthesizing ? 'Tissage du récit...' : '✨ Tisser le Récit Slow Travel'}
            </button>

            {/* Prévisualisation de la synthèse */}
            {synthesis && (
              <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400">Récit Tissé & Certifié</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <Check className="w-3 h-3" />
                    Voix 100% Conforme (Score: {synthesis.brandScore}/100)
                  </span>
                </div>

                <div className="text-xs text-stone-300 bg-stone-900/80 p-3 rounded-lg border border-stone-800 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block font-semibold">
                      Anecdote PhotoEvidence ({synthesis.anecdote.length}/200 car.) :
                    </span>
                    <p className="italic text-stone-200">« {synthesis.anecdote} »</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block font-semibold">
                      Paragraphe d'Immersion :
                    </span>
                    <p className="text-stone-300">{synthesis.richParagraph}</p>
                  </div>
                  {synthesis.counterpointNote && (
                    <p className="text-amber-300/90 text-[11px]">{synthesis.counterpointNote}</p>
                  )}
                </div>

                <button
                  onClick={handleApply}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Appliquer directement au Bloc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
