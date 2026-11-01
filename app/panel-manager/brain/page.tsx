'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Brain,
  UploadCloud,
  Copy,
  Save,
  AlertTriangle,
  ShieldAlert,
  Info,
  Layers,
  Film,
  ExternalLink,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

const BRAIN = 'http://127.0.0.1:8470';

type Controle = {
  conforme: boolean;
  mots_bannis: string[];
  pronoms_bannis: string[];
  pronoms_manquants: string[];
  echo_prompt: string[];
  longueur: number;
};

type Vision = {
  lumiere: string;
  textures: string[];
  couleurs: string;
  objets_visibles: string[];
  incertitudes: string[];
};

type Reponse = {
  vision: Vision;
  vision_texte?: string;
  legende: string;
  controle: Controle;
  avertissements: string[];
  fournisseurs: { vision: string; redaction: string };
  durees: { vision_s: number; total_s: number };
  repasses: number;
};

type CarouselSlide = {
  slide_num: number;
  type: string;
  tag?: string;
  headline?: string;
  subheadline?: string;
  body?: string;
  tip?: string;
  hint?: string;
};

type CarouselResult = {
  carousel: {
    topic: string;
    slides: CarouselSlide[];
    caption: string;
    hashtags: string;
  };
  fournisseur: string;
  controle: Controle;
  avertissements: string[];
};

type MediaItem = { nom: string; url: string };

function BrainPageContent() {
  const searchParams = useSearchParams();

  // Source selection: 'file' | 'media' | 'url'
  const [sourceMode, setSourceMode] = useState<'file' | 'media' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Médiathèque
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [mediaFolder, setMediaFolder] = useState<'destinations' | 'articles'>('destinations');
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Champs éditoriaux
  const [placeTitle, setPlaceTitle] = useState('');
  const [notes, setNotes] = useState('');

  // Clés API optionnelles
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  // État d'exécution
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Reponse | null>(null);
  const [legende, setLegende] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [copieSucces, setCopieSucces] = useState(false);
  const [memoriseSucces, setMemoriseSucces] = useState(false);

  // Carrousel
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselResult, setCarouselResult] = useState<CarouselResult | null>(null);

  // Statut du service Brain
  const [brainOnline, setBrainOnline] = useState<boolean | null>(null);

  // Tester si le Brain répond au chargement
  useEffect(() => {
    fetch(`${BRAIN}/api/status`)
      .then((r) => {
        if (r.ok) setBrainOnline(true);
        else setBrainOnline(false);
      })
      .catch(() => setBrainOnline(false));
  }, []);

  // Prendre en compte l'URL passée en query parameter (?url=...&title=...)
  useEffect(() => {
    const paramUrl = searchParams.get('url');
    const paramTitle = searchParams.get('title');
    if (paramUrl) {
      setSelectedUrl(paramUrl);
      setPreviewUrl(paramUrl);
      setSourceMode('url');
    }
    if (paramTitle) {
      setPlaceTitle(paramTitle);
    }
  }, [searchParams]);

  // Charger la médiathèque Supabase Storage
  const chargerMediatheque = useCallback(async (dossier: string) => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`/api/cms/media?prefix=${dossier}`);
      if (!res.ok) throw new Error(`Médiathèque indisponible (${res.status})`);
      const data = await res.json();
      const fichiers: Array<{ name?: string; filename?: string; url: string }> =
        data.files ?? data.media ?? [];
      setMedias(
        fichiers
          .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f.name ?? f.filename ?? ''))
          .map((f) => ({ nom: f.name ?? f.filename ?? 'photo', url: f.url }))
      );
    } catch (e: unknown) {
      console.warn('Impossible de charger la médiathèque', e);
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    if (sourceMode === 'media') {
      chargerMediatheque(mediaFolder);
    }
  }, [sourceMode, mediaFolder, chargerMediatheque]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const choisi = e.target.files?.[0];
    if (!choisi) return;
    if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
    setFile(choisi);
    setSelectedUrl('');
    setPreviewUrl(URL.createObjectURL(choisi));
    setResult(null);
    setLegende('');
    setErreur(null);
  };

  const choisirDepuisMediatheque = (url: string) => {
    setSelectedUrl(url);
    setPreviewUrl(url);
    setFile(null);
    setResult(null);
    setLegende('');
    setErreur(null);
  };

  const appliquerUrlDirecte = (url: string) => {
    const clean = url.trim();
    if (!clean) return;
    setSelectedUrl(clean);
    setPreviewUrl(clean);
    setFile(null);
    setResult(null);
    setLegende('');
    setErreur(null);
  };

  const handleGenerate = async () => {
    if (!file && !selectedUrl) return;
    setLoading(true);
    setResult(null);
    setCarouselResult(null);
    setErreur(null);
    setCopieSucces(false);
    setMemoriseSucces(false);

    try {
      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (groqKey) formData.append('groq_key', groqKey);
        if (geminiKey) formData.append('gemini_key', geminiKey);
        if (notes.trim()) formData.append('notes', notes.trim());
        if (placeTitle.trim()) formData.append('place_title', placeTitle.trim());

        response = await fetch(`${BRAIN}/api/analyze-image`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${BRAIN}/api/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: selectedUrl,
            groq_key: groqKey || undefined,
            gemini_key: geminiKey || undefined,
            notes: notes.trim() || undefined,
            place_title: placeTitle.trim() || undefined,
          }),
        });
      }

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const corps = await response.json();
          if (corps?.detail) detail = corps.detail;
        } catch {
          // pas de json
        }
        setErreur(
          `Le Heldonica Brain a répondu ${response.status} : ${detail}` +
            (response.status === 503
              ? " Vérifie qu'Ollama tourne (port 11434) ou renseigne une clé Groq/Gemini."
              : '')
        );
        return;
      }

      const data: Reponse = await response.json();
      setResult(data);
      setLegende(data.legende);
      setBrainOnline(true);
    } catch (e: unknown) {
      setErreur(
        'Aucun Brain ne répond sur 127.0.0.1:8470. ' +
          'Vérifie que le serveur Copilote est lancé (LANCER_HELDONICA_BRAIN.bat ou python server.py).'
      );
      setBrainOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!result && !placeTitle) return;
    setCarouselLoading(true);
    try {
      const topic =
        placeTitle.trim() ||
        (result?.vision.objets_visibles.length
          ? result.vision.objets_visibles.slice(0, 3).join(', ')
          : 'Slow travel et carnet de route');

      const res = await fetch(`${BRAIN}/api/generate-carousel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          notes: notes.trim() || undefined,
          vision_texte: result?.vision_texte || undefined,
          groq_key: groqKey || undefined,
          slide_count: 6,
        }),
      });

      if (!res.ok) {
        const corps = await res.json().catch(() => ({}));
        throw new Error(corps?.detail || `Erreur HTTP ${res.status}`);
      }

      const carData: CarouselResult = await res.json();
      setCarouselResult(carData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErreur(`Impossible de générer le carrousel : ${msg}`);
    } finally {
      setCarouselLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!legende) return;
    try {
      await navigator.clipboard.writeText(legende);
      setCopieSucces(true);
      setTimeout(() => setCopieSucces(false), 3000);
    } catch {
      setErreur('Copie impossible : sélectionne le texte à la main.');
    }
  };

  const handleMemorize = async () => {
    if (!legende.trim()) return;
    try {
      const reponse = await fetch(`${BRAIN}/api/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: legende }),
      });
      const corps = await reponse.json();
      if (!reponse.ok) {
        setErreur(`Mémorisation refusée : ${corps?.detail ?? reponse.status}`);
        return;
      }
      setMemoriseSucces(true);
      setTimeout(() => setMemoriseSucces(false), 3000);
    } catch {
      setErreur('Mémorisation impossible : aucun Brain ne répond sur 127.0.0.1:8470.');
    }
  };

  const photoPrête = Boolean(file || selectedUrl);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-3 text-stone-900">
            <Brain className="w-8 h-8 text-emerald-600" />
            Heldonica Brain — Copilote Créatif
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Création de contenu (légendes, carrousels, récits) depuis une sélection de photos ou l&apos;APK mobile.
            Règle d&apos;or : <em>On n&apos;invente rien.</em>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {brainOnline === true && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Brain Connecté (8470)
            </span>
          )}
          {brainOnline === false && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Brain hors-ligne
            </span>
          )}
        </div>
      </div>

      {erreur && (
        <div className="bg-red-50 border border-red-300 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-900 whitespace-pre-line">{erreur}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne gauche : Sélection photo & Contexte */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              1. Choix de la photo
            </h2>

            {/* Onglets source */}
            <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSourceMode('file')}
                className={`flex-1 py-2 rounded-lg transition ${
                  sourceMode === 'file' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                📁 Fichier local
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('media')}
                className={`flex-1 py-2 rounded-lg transition ${
                  sourceMode === 'media' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🖼️ Médiathèque CMS
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('url')}
                className={`flex-1 py-2 rounded-lg transition ${
                  sourceMode === 'url' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🔗 URL directe
              </button>
            </div>

            {/* Mode 1 : Fichier local */}
            {sourceMode === 'file' && (
              <label className="border-2 border-dashed border-emerald-200 bg-emerald-50/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100/50 transition">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Aperçu" className="max-h-60 rounded-lg shadow-sm object-contain" />
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-emerald-500 mb-2" />
                    <span className="text-emerald-800 font-medium text-sm">Sélectionner une photo depuis le poste</span>
                    <span className="text-xs text-emerald-600 mt-1">PNG, JPG, WebP jusqu&apos;à 20 Mo</span>
                  </>
                )}
              </label>
            )}

            {/* Mode 2 : Médiathèque Supabase */}
            {sourceMode === 'media' && (
              <div className="space-y-3">
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaFolder('destinations')}
                    className={`px-3 py-1.5 rounded-lg border ${
                      mediaFolder === 'destinations' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600'
                    }`}
                  >
                    Dossier Destinations
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFolder('articles')}
                    className={`px-3 py-1.5 rounded-lg border ${
                      mediaFolder === 'articles' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600'
                    }`}
                  >
                    Dossier Articles
                  </button>
                  <button
                    type="button"
                    onClick={() => chargerMediatheque(mediaFolder)}
                    className="ml-auto px-2 py-1 text-stone-500 hover:text-stone-800"
                    title="Actualiser"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingMedia ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {loadingMedia && <p className="col-span-full text-center text-xs text-stone-500 py-6">Chargement…</p>}
                  {!loadingMedia && medias.length === 0 && (
                    <p className="col-span-full text-center text-xs text-stone-400 py-6">Aucune photo dans ce dossier.</p>
                  )}
                  {medias.map((m) => {
                    const isSelected = selectedUrl === m.url;
                    return (
                      <button
                        key={m.url}
                        type="button"
                        onClick={() => choisirDepuisMediatheque(m.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                          isSelected ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-transparent hover:opacity-90'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.url} alt={m.nom} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 3 : URL directe */}
            {sourceMode === 'url' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://.../photo.jpg"
                    value={selectedUrl}
                    onChange={(e) => setSelectedUrl(e.target.value)}
                    className="flex-1 p-2 text-xs border border-stone-300 rounded-lg focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => appliquerUrlDirecte(selectedUrl)}
                    className="px-3 py-2 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-900"
                  >
                    Aperçu
                  </button>
                </div>
                {previewUrl && (
                  <div className="rounded-xl overflow-hidden border border-stone-200 flex justify-center bg-stone-50 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Aperçu URL" className="max-h-56 rounded object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Notes de l'autrice & Lieu */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Lieu ou étape (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Pont de Lima, Sintra, Brașov…"
                  value={placeTitle}
                  onChange={(e) => setPlaceTitle(e.target.value)}
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Notes de l&apos;autrice / Vécu sensoriel (recommandé)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ce que vous avez ressenti, goûté, entendu ou observé là-bas… Si laissé vide, l'IA s'en tient strictement au visuel et termine par [À TOI]."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Clés optionnelles (Groq / Gemini) */}
            <details className="p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs text-stone-600">
              <summary className="cursor-pointer font-semibold flex items-center gap-1.5 text-stone-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Accélération Cloud optionnelle (Groq / Gemini)
              </summary>
              <p className="mt-2 text-stone-500 leading-relaxed">
                Par défaut, le copilote utilise votre carte locale NVIDIA GTX 1660 Ti via Ollama (100% gratuit).
                Renseigner des clés cloud bascule vers Gemini 2.5 Flash et Groq Llama/GPT-OSS pour une réponse en 3 secondes.
              </p>
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  placeholder="Clé Groq (rédaction rapide)"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-300 rounded bg-white"
                />
                <input
                  type="password"
                  placeholder="Clé Gemini (vision multimodale)"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full p-2 text-xs border border-stone-300 rounded bg-white"
                />
              </div>
            </details>

            {/* Bouton de génération */}
            <button
              onClick={handleGenerate}
              disabled={!photoPrête || loading}
              className={`w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition shadow-md ${
                !photoPrête || loading ? 'bg-stone-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? (
                <span>Analyse de l&apos;image & rédaction en cours…</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyser la photo & Rédiger la légende
                </>
              )}
            </button>
          </div>
        </div>

        {/* Colonne droite : Résultats, Légende & Carrousel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              2. Brouillon éditorial vérifié
            </h2>

            {result ? (
              <div className="flex flex-col h-full gap-4">
                {/* Garde-fous et Avertissements */}
                {result.avertissements.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl">
                    <p className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-1">
                      <ShieldAlert className="w-4 h-4" />
                      Garde-fous voix de marque
                    </p>
                    <ul className="text-xs text-amber-900 list-disc pl-5 space-y-0.5">
                      {result.avertissements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <p className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Conforme à la voix Heldonica : aucun mot banni, pronoms B2C respectés.
                    </p>
                  </div>
                )}

                {/* Inventaire visuel détaillé */}
                <details className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs text-stone-700">
                  <summary className="cursor-pointer font-semibold">
                    Ce que l&apos;analyse visuelle a authentifié sur la photo
                  </summary>
                  {result.vision.objets_visibles.length > 0 ? (
                    <ul className="mt-2 list-disc pl-5 space-y-0.5">
                      {result.vision.objets_visibles.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 italic">Aucun objet identifié avec certitude.</p>
                  )}
                  {result.vision.incertitudes.length > 0 && (
                    <p className="mt-2 text-stone-500">
                      <strong>Incertitudes (non inventées) :</strong> {result.vision.incertitudes.join(' · ')}
                    </p>
                  )}
                  <p className="mt-2 text-stone-400">
                    Moteurs : {result.fournisseurs.vision} (vision) / {result.fournisseurs.redaction} (rédaction) · {result.durees.total_s}s
                  </p>
                </details>

                {/* Zone de texte de la légende */}
                <textarea
                  value={legende}
                  onChange={(e) => setLegende(e.target.value)}
                  className="flex-1 w-full p-4 text-xs font-sans border border-stone-300 rounded-xl focus:ring-emerald-500 min-h-[220px] leading-relaxed"
                />

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    {copieSucces ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copieSucces ? 'Copié !' : 'Copier'}
                  </button>

                  <button
                    onClick={handleMemorize}
                    className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition border border-indigo-200"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {memoriseSucces ? 'Mémorisé !' : 'Mémoriser style'}
                  </button>

                  <button
                    onClick={handleGenerateCarousel}
                    disabled={carouselLoading}
                    className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition border border-purple-200 disabled:opacity-50"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {carouselLoading ? 'Génération…' : '🎠 Carrousel'}
                  </button>

                  <a
                    href={`/panel-manager/auto-shorts`}
                    className="py-2 px-3 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Film className="w-3.5 h-3.5" />
                    Auto-Shorts
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>

                {/* Carrousel généré */}
                {carouselResult && (
                  <div className="mt-4 p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-700" />
                        Carrousel Instagram ({carouselResult.carousel.slides.length} diapositives)
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(carouselResult.carousel, null, 2));
                          alert('JSON du carrousel copié dans le presse-papier !');
                        }}
                        className="text-xs text-purple-700 underline"
                      >
                        Copier le JSON
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {carouselResult.carousel.slides.map((s, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-purple-100 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-purple-800">
                            <span>Diapo {s.slide_num} ({s.type})</span>
                            {s.tag && <span className="text-[10px] bg-purple-100 px-1.5 py-0.5 rounded">{s.tag}</span>}
                          </div>
                          {s.headline && <p className="font-semibold text-stone-800">{s.headline}</p>}
                          {s.subheadline && <p className="text-stone-600 italic">{s.subheadline}</p>}
                          {s.body && <p className="text-stone-700">{s.body}</p>}
                          {s.tip && <p className="text-emerald-700 text-[11px]">💡 {s.tip}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-12 text-center border-2 border-dashed border-stone-200 rounded-2xl">
                <Brain className="w-16 h-16 text-stone-200 mb-3" />
                <p className="font-medium text-stone-600">En attente d&apos;une photo</p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Choisis une photo depuis ton poste, ta médiathèque CMS ou ton APK mobile. Le Cerveau Heldonica
                  en extrait un inventaire visuel et compose une légende slow travel fidèle au vécu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeldonicaBrainPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-12 text-center text-stone-500 font-medium">
          Chargement du copilote Heldonica Brain…
        </div>
      }
    >
      <BrainPageContent />
    </Suspense>
  );
}
