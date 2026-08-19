'use client';

import { useState } from 'react';

interface AiCopilotModalProps {
  isOpen: boolean;
  initialText: string;
  onClose: () => void;
  onApply: (generatedHtmlOrText: string) => void;
}

type AiMode =
  | 'voice_polish'
  | 'expand_notes'
  | 'email_sequence'
  | 'destination_hub'
  | 'b2c_instagram'
  | 'b2b_linkedin'
  | 'case_study'
  | 'audit_refresh'
  | 'structure_itinerary'
  | 'generate_excerpt';

export default function AiCopilotModal({
  isOpen,
  initialText,
  onClose,
  onApply,
}: AiCopilotModalProps) {
  const [audience, setAudience] = useState<'b2c' | 'b2b'>('b2c');
  const [mode, setMode] = useState<AiMode>('voice_polish');
  const [inputText, setInputText] = useState(initialText || '');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [variants, setVariants] = useState<[string, string] | null>(null);
  const [validation, setValidation] = useState<any | null>(null);
  const [providerInfo, setProviderInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!inputText && mode !== 'structure_itinerary' && mode !== 'email_sequence' && mode !== 'destination_hub') {
      setError('Veuillez saisir du texte, des notes ou des faits réels.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setVariants(null);
    setValidation(null);
    setProviderInfo(null);

    try {
      const res = await fetch('/api/cms/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          audience,
          text: inputText,
          destination: destination || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la génération IA');
      }

      if (data.provider && data.model) {
        setProviderInfo(`${data.provider.toUpperCase()} (${data.model})`);
      }

      if (data.validation) {
        setValidation(data.validation);
      }

      if (mode === 'voice_polish' && data.data) {
        const d = data.data;
        const v1 = d.variant_1 || (Array.isArray(d) ? d[0] : typeof d === 'string' ? d : '');
        const v2 = d.variant_2 || (Array.isArray(d) ? d[1] : '');
        setVariants([v1, v2].filter(Boolean) as [string, string]);
      } else if (typeof data.data === 'string') {
        setResult(data.data);
      } else if (data.data && typeof data.data === 'object') {
        setResult(JSON.stringify(data.data, null, 2));
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (textToApply: string) => {
    let html = textToApply
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^\> \*(.*)\*$/gim, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/\n/g, '<br />');

    onApply(html);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Copilote Éditorial Heldonica
              </h3>
              <p className="text-xs text-stone-500">
                « On n’invente rien. On raconte ce qu’on a vécu. » — Checklist 7 garde-fous intégrée
              </p>
            </div>
          </div>

          {/* B2C / B2B Toggle */}
          <div className="flex items-center gap-3">
            <div className="bg-stone-200/80 p-1 rounded-xl flex text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAudience('b2c')}
                className={`px-3 py-1 rounded-lg transition ${
                  audience === 'b2c' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🌿 B2C (« on/tu »)
              </button>
              <button
                type="button"
                onClick={() => setAudience('b2b')}
                className={`px-3 py-1 rounded-lg transition ${
                  audience === 'b2b' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                💼 B2B (« on/vous »)
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50/50 gap-2 pt-3 overflow-x-auto">
          {[
            { key: 'voice_polish', label: '🌿 Sublimer la Voix' },
            { key: 'expand_notes', label: '📝 Notes ➔ Carnet' },
            { key: 'email_sequence', label: '✉️ Séquence Email' },
            { key: 'destination_hub', label: '📍 Page Hub / Région' },
            { key: 'b2c_instagram', label: '📸 Caption Instagram' },
            { key: 'b2b_linkedin', label: '💼 LinkedIn (P-A-S)' },
            { key: 'case_study', label: '🏆 Témoignage / Étude' },
            { key: 'audit_refresh', label: '🔄 Audit 3R Ancien Contenu' },
            { key: 'structure_itinerary', label: '🗺️ Itinéraire Slow' },
            { key: 'generate_excerpt', label: '🎯 Accroche' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setMode(tab.key as AiMode);
                setResult(null);
                setVariants(null);
                setValidation(null);
                setError(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                mode === tab.key
                  ? 'border-eucalyptus text-eucalyptus'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Inputs */}
          <div className="space-y-4">
            {(mode === 'structure_itinerary' || mode === 'b2c_instagram' || mode === 'email_sequence' || mode === 'destination_hub') && (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Destination ciblée
                </label>
                <input
                  type="text"
                  placeholder="Ex : Madère (Nord sauvage), Sicile (Val di Noto), Roumanie (Transylvanie)..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {mode === 'expand_notes'
                  ? 'Vos données / notes de terrain vérifiées'
                  : mode === 'audit_refresh'
                  ? 'Ancien texte à auditer et réécrire selon les 3R'
                  : mode === 'case_study'
                  ? 'Faits sur le couple ou l’hôtel accompagné'
                  : mode === 'b2b_linkedin'
                  ? 'Faits chiffrés ou friction hôtelière constatée'
                  : mode === 'voice_polish'
                  ? 'Texte à reformuler / polir'
                  : 'Notes, contexte ou texte source'}
              </label>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === 'expand_notes'
                    ? 'Collez vos notes vérifiées : lieux, rencontres, odeurs, bruits, météo, adresses réelles...'
                    : mode === 'audit_refresh'
                    ? 'Collez l’article ou paragraphe existant à mettre à jour et débarrasser des anciens mots bannis...'
                    : 'Collez les informations nécessaires...'
                }
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500 italic">
                {audience === 'b2c' ? 'Mode B2C : Duo « on », Lecteur « tu »' : 'Mode B2B : Duo « on », Hôtelier « vous »'}
              </span>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2.5 bg-mahogany hover:bg-eucalyptus text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Génération en cours…
                  </>
                ) : (
                  <>✨ Générer selon les 7 garde-fous</>
                )}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
              {error}
            </div>
          )}

          {/* Validation des 7 Garde-fous */}
          {validation && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Vérification Garde-fous Heldonica :
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    validation.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Score : {validation.score}% ({validation.passed ? '7/7 Validés ✅' : 'À ajuster ⚠️'})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                {Object.entries(validation.checks).map(([key, c]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
                      c.ok ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900' : 'border-amber-200 bg-amber-50/50 text-amber-900'
                    }`}
                  >
                    <span>{c.ok ? '✓' : '✗'}</span>
                    <span className="truncate">{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résultats - Variantes (Voice Polish) */}
          {variants && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Variantes générées :
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between space-y-4 hover:border-eucalyptus transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-eucalyptus/10 text-eucalyptus">
                        Option {i + 1}
                      </span>
                      <p className="text-sm text-stone-800 mt-2.5 whitespace-pre-wrap leading-relaxed">
                        {v}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(v)}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Insérer cette version
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résultats - Texte Unique */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Résultat généré :
                </h4>
                <button
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="px-4 py-1.5 bg-eucalyptus hover:bg-eucalyptus/90 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  ✓ Insérer dans l’éditeur
                </button>
              </div>
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 max-h-72 overflow-y-auto">
                <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                  {result}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="text-[11px] text-stone-400 font-mono">
            {providerInfo ? `Moteur : ${providerInfo}` : 'Voix Heldonica active'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-stone-300 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-100 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
