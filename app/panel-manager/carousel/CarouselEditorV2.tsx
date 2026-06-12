'use client'

import { useState, useRef } from 'react'
import AIChatPanel from './AIChatPanel'
import SlidePreviewPanel from './SlidePreviewPanel'
import FilmStripPanel from './FilmStripPanel'
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
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left: AI Chat */}
        <div className="col-span-4 min-h-0">
          <AIChatPanel
            onSlidesGenerated={handleSlidesGenerated}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </div>

        {/* Center: Preview */}
        <div className="col-span-5 min-h-0">
          <SlidePreviewPanel
            slide={activeSlide}
            aspectRatio={aspectRatio}
            brandOverlay={brandOverlay}
            previewRef={previewRef}
          />
        </div>

        {/* Right: Filmstrip */}
        <div className="col-span-3 min-h-0">
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

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors">
            💾 Sauvegarder
          </button>
          <button className="px-4 py-2 text-sm bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors">
            📋 Historique
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors">
            📥 Exporter
          </button>
          <button className="px-4 py-2 text-sm bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 transition-colors">
            ✨ Générer caption
          </button>
        </div>
      </div>
    </div>
  )
}