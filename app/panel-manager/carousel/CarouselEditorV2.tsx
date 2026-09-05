'use client'

import { useState, useRef } from 'react'
import AIChatPanel from './AIChatPanel'
import SlidePreviewPanel from './SlidePreviewPanel'
import PhotoPickerPanel from './PhotoPickerPanel'
import FilmStripPanel from './FilmStripPanel'
import SlideExport from './SlideExport'
import CaptionGenerator from './CaptionGenerator'
import { HELDONICA_TOKENS, SlideData, AspectRatio } from './tokens'

interface CarouselEditorV2Props {
  onComplete?: (carousel: any) => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function CarouselEditorV2({ onComplete }: CarouselEditorV2Props) {
  const [slides, setSlides] = useState<SlideData[]>([
    { id: generateId(), title: '', content: '', cta: '' },
  ])
  const [activeSlideId, setActiveSlideId] = useState<string>(slides[0]?.id || '')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square')
  const [brandOverlay, setBrandOverlay] = useState(true)
  const [faceless, setFaceless] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Le sujet nomme le carrousel : il sert au titre de la sauvegarde et de point
  // de depart a la legende.
  const [sujet, setSujet] = useState('')
  const [legende, setLegende] = useState('')
  const [motsCles, setMotsCles] = useState<string[]>([])

  // Un seul panneau ouvert a la fois, sous la barre d'actions.
  const [panneau, setPanneau] = useState<'aucun' | 'export' | 'legende' | 'historique'>('aucun')
  const [message, setMessage] = useState<string | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)
  const [historique, setHistorique] = useState<any[] | null>(null)

  const basculer = (cible: typeof panneau) =>
    setPanneau(p => (p === cible ? 'aucun' : cible))

  /** Enregistre le carrousel courant dans cms_carousel_history. */
  const enregistrer = async () => {
    setEnregistrement(true)
    setMessage(null)
    try {
      const res = await fetch('/api/cms/carousel-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: sujet || 'Sans titre',
          title: sujet || 'Sans titre',
          caption: legende,
          hashtags: motsCles,
          slides,
          images: slides.map(d => d.image).filter(Boolean),
        }),
      })
      if (!res.ok) {
        setMessage(
          res.status === 401
            ? 'Session expirée : reconnecte-toi au panneau.'
            : "Le carrousel n'a pas pu être enregistré."
        )
        return
      }
      setMessage('Carrousel enregistré.')
      // L'historique affiché devient caduc.
      setHistorique(null)
    } catch {
      setMessage('Enregistrement impossible : réseau injoignable.')
    } finally {
      setEnregistrement(false)
    }
  }

  /** Liste les carrousels enregistrés. */
  const chargerHistorique = async () => {
    basculer('historique')
    if (historique) return
    try {
      const res = await fetch('/api/cms/carousel-history')
      if (!res.ok) {
        setMessage("L'historique n'a pas pu être lu.")
        setHistorique([])
        return
      }
      const data = await res.json()
      setHistorique(Array.isArray(data?.history) ? data.history : [])
    } catch {
      setMessage("L'historique est injoignable.")
      setHistorique([])
    }
  }

  /** Reprend un carrousel enregistré. */
  const reprendre = (entree: any) => {
    const reprises: SlideData[] = (entree.slides || []).map((d: SlideData) => ({
      ...d,
      id: generateId(),
    }))
    if (reprises.length === 0) {
      setMessage('Ce carrousel ne contient aucune diapositive.')
      return
    }
    setSlides(reprises)
    setActiveSlideId(reprises[0].id)
    setSujet(entree.topic || entree.title || '')
    setLegende(entree.caption || '')
    setMotsCles(entree.hashtags || [])
    setPanneau('aucun')
    setMessage(`« ${entree.title || entree.topic || 'Carrousel'} » repris.`)
  }

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0]

  const handleSlidesGenerated = (newSlides: SlideData[]) => {
    const slidesWithIds = newSlides.map(s => ({
      ...s,
      id: generateId(),
    }))
    setSlides(slidesWithIds)
    if (slidesWithIds.length > 0) {
      setActiveSlideId(slidesWithIds[0].id)
    }
  }

  const handleSlidesReorder = (reorderedSlides: SlideData[]) => {
    setSlides(reorderedSlides)
  }

  const handleSlideDelete = (id: string) => {
    if (slides.length <= 1) return
    const newSlides = slides.filter(s => s.id !== id)
    setSlides(newSlides)
    if (activeSlideId === id) {
      setActiveSlideId(newSlides[0]?.id || '')
    }
  }

  const handleSlideAdd = () => {
    const newSlide: SlideData = {
      id: generateId(),
      title: '',
      content: '',
      cta: '',
    }
    setSlides([...slides, newSlide])
    setActiveSlideId(newSlide.id)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">🎠 Carrousel Instagram V2</h2>
          <p className="text-xs text-stone-500">Éditeur 3 panneaux avec IA</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Aspect ratio selector */}
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            {(Object.keys(HELDONICA_TOKENS.aspectRatios) as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-white shadow text-[#6b2a1a] font-medium'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {HELDONICA_TOKENS.aspectRatios[ratio].label.split('/')[0].trim()}
              </button>
            ))}
          </div>
          
          {/* Brand options */}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={brandOverlay}
              onChange={(e) => setBrandOverlay(e.target.checked)}
              className="rounded border-stone-300"
            />
            <span className="text-stone-600">Logo</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={faceless}
              onChange={(e) => setFaceless(e.target.checked)}
              className="rounded border-stone-300"
            />
            <span className="text-stone-600">Faceless</span>
          </label>
        </div>
      </div>

      {/* 3-panel layout */}
      {/* Une seule colonne sous md : la grille en 12 colonnes ecrasait chaque
          panneau a un mot par ligne sur un telephone, rendant l'editeur
          inutilisable depuis l'application mobile. */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        {/* Left: AI Chat */}
        <div className="md:col-span-4 min-h-0">
          <AIChatPanel
            onSlidesGenerated={handleSlidesGenerated}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </div>

        {/* Center: Preview */}
        <div className="md:col-span-5 min-h-0">
          <SlidePreviewPanel
            slide={activeSlide}
            aspectRatio={aspectRatio}
            brandOverlay={brandOverlay}
            previewRef={previewRef}
          />

          {activeSlide && (
            <PhotoPickerPanel
              valeur={activeSlide.image}
              onChoisir={(url) => setSlides(slides.map(s =>
                s.id === activeSlide.id ? { ...s, image: url } : s
              ))}
            />
          )}
        </div>

        {/* Right: Filmstrip */}
        <div className="md:col-span-3 min-h-0">
          <FilmStripPanel
            slides={slides}
            activeSlideId={activeSlideId}
            onSlideSelect={setActiveSlideId}
            onSlidesReorder={handleSlidesReorder}
            onSlideDelete={handleSlideDelete}
            onSlideAdd={handleSlideAdd}
          />
        </div>
      </div>

      {/* Sujet du carrousel : nomme la sauvegarde et amorce la légende. */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <input
          value={sujet}
          onChange={e => setSujet(e.target.value)}
          placeholder="Sujet du carrousel — ex : Maramureș, les portes en bois"
          className="w-full px-4 py-2 text-sm border border-stone-200 rounded-xl"
        />
      </div>

      {/* Barre d'actions.
          Les quatre boutons n'avaient aucun onClick : ils ne faisaient rien, et
          rien ne le disait. Les panneaux Export et Légende existaient comme
          fichiers sans être montés nulle part. */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex gap-2">
          <button
            onClick={enregistrer}
            disabled={enregistrement}
            className="px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 disabled:opacity-50 transition-colors"
          >
            {enregistrement ? 'Enregistrement…' : '💾 Sauvegarder'}
          </button>
          <button
            onClick={chargerHistorique}
            className="px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors"
          >
            📋 Historique
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => basculer('export')}
            className="px-4 py-2 text-sm border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
          >
            📥 Exporter
          </button>
          <button
            onClick={() => basculer('legende')}
            className="px-4 py-2 text-sm bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 transition-colors"
          >
            ✨ Légende
          </button>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-stone-600 bg-stone-50 rounded-xl px-4 py-2">{message}</p>
      )}

      {panneau === 'export' && (
        <div className="mt-3">
          <SlideExport
            slides={slides}
            aspectRatio={aspectRatio}
            brandOverlay={brandOverlay}
            title={sujet}
            legende={legende}
            motsCles={motsCles}
          />
        </div>
      )}

      {panneau === 'legende' && (
        <div className="mt-3">
          <CaptionGenerator
            topic={sujet}
            slides={slides}
            onCaptionGenerated={(c, h) => { setLegende(c); setMotsCles(h) }}
          />
        </div>
      )}

      {panneau === 'historique' && (
        <div className="mt-3 bg-white rounded-2xl border border-stone-200 p-4">
          <h3 className="font-semibold text-stone-800 text-sm mb-3">📋 Carrousels enregistrés</h3>
          {historique === null && <p className="text-sm text-stone-500">Chargement…</p>}
          {historique?.length === 0 && (
            <p className="text-sm text-stone-500">
              Aucun carrousel enregistré pour l&apos;instant.
            </p>
          )}
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {historique?.map((e: any) => (
              <li key={e.id} className="flex items-center justify-between gap-3 border border-stone-100 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-stone-800 truncate">{e.title || e.topic || 'Sans titre'}</p>
                  <p className="text-xs text-stone-400">
                    {(e.slides?.length ?? 0)} diapositive(s) — {new Date(e.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => reprendre(e)}
                  className="shrink-0 px-3 py-1.5 text-xs border border-stone-200 rounded-lg hover:bg-stone-50"
                >
                  Reprendre
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}