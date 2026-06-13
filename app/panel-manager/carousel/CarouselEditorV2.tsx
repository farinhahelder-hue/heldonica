'use client'

import { useState, useRef, useCallback } from 'react'
import AIChatPanel from './AIChatPanel'
import SlidePreviewPanel from './SlidePreviewPanel'
import FilmStripPanel from './FilmStripPanel'
import BrandConfigPanel from './BrandConfigPanel'
import CaptionGenerator from './CaptionGenerator'
import { HELDONICA_TOKENS, HELDONICA_BRAND, SlideData, AspectRatio, BrandConfig } from './tokens'

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
  const [showBrandConfig, setShowBrandConfig] = useState(false)
  const [showCaption, setShowCaption] = useState(false)
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(HELDONICA_BRAND)
  const previewRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Map<string, HTMLElement>>(new Map())

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0]
  const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId)

  const getSlideElement = useCallback((index: number): HTMLElement | null => {
    return slideRefs.current.get(slides[index]?.id) || null
  }, [slides])

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

  const handleApplyConfig = (config: BrandConfig) => {
    setBrandConfig(config)
    setShowBrandConfig(false)
  }

  const handleApplyPalette = (palette: typeof HELDONICA_TOKENS.palettes[0]) => {
    setBrandConfig({
      ...brandConfig,
      colors: {
        ...brandConfig.colors,
        background: palette.bg,
        primary: palette.accent,
        text: palette.text,
      }
    })
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
          
          {/* Settings buttons */}
          <button
            onClick={() => setShowBrandConfig(!showBrandConfig)}
            className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            ⚙️ Marque
          </button>
        </div>
      </div>

      {/* Brand Config Panel */}
      {showBrandConfig && (
        <div className="mb-4">
          <BrandConfigPanel
            slides={slides}
            onApplyConfig={handleApplyConfig}
            onApplyPalette={handleApplyPalette}
          />
        </div>
      )}

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
            slideIndex={activeSlideIndex}
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
            getSlideElement={getSlideElement}
          />
        </div>
      </div>

      {/* Caption Panel */}
      {showCaption && (
        <div className="mt-4">
          <CaptionGenerator
            topic={slides.map(s => s.title).join(' ') || 'Carrousel Heldonica'}
            slides={slides}
            defaultHashtags={brandConfig.defaultHashtags}
          />
        </div>
      )}

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
          <button 
            onClick={() => setShowCaption(!showCaption)}
            className="px-4 py-2 text-sm border border-[#83C5BE] text-[#83C5BE] rounded-xl hover:bg-[#83C5BE]/10 transition-colors"
          >
            ✨ Caption
          </button>
          <button className="px-4 py-2 text-sm bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 transition-colors">
            📥 Exporter
          </button>
        </div>
      </div>
    </div>
  )
}