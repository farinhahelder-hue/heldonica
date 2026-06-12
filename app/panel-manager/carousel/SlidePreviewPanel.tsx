'use client'

import { useRef } from 'react'
import { SlideData, HELDONICA_TOKENS, AspectRatio } from './tokens'

interface SlidePreviewPanelProps {
  slide: SlideData | null
  aspectRatio: AspectRatio
  brandOverlay: boolean
  previewRef: React.RefObject<HTMLDivElement | null>
}

export default function SlidePreviewPanel({ slide, aspectRatio, brandOverlay, previewRef }: SlidePreviewPanelProps) {
  const ratio = HELDONICA_TOKENS.aspectRatios[aspectRatio]
  const tokens = HELDONICA_TOKENS.colors

  if (!slide) {
    return (
      <div className="flex items-center justify-center h-full bg-stone-100 rounded-2xl border-2 border-dashed border-stone-300">
        <div className="text-center text-stone-400">
          <div className="text-4xl mb-2">📱</div>
          <p className="text-sm">Sélectionnez une slide dans le filmstrip</p>
        </div>
      </div>
    )
  }

  const bgColor = slide.backgroundColor || tokens.background
  const txtColor = slide.textColor || tokens.text

  return (
    <div className="flex flex-col h-full">
      {/* Preview info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-medium text-stone-500">{ratio.label} • {ratio.width}×{ratio.height}</span>
        <span className="text-xs text-stone-400">#{slide.id}</span>
      </div>

      {/* Preview container with aspect ratio */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-stone-100 rounded-2xl p-4">
        <div
          ref={previewRef as React.RefObject<HTMLDivElement>}
          style={{
            width: '100%',
            aspectRatio: `${ratio.width} / ${ratio.height}`,
            maxWidth: '400px',
            backgroundColor: bgColor,
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
          data-slide-id={slide.id}
          data-aspect-ratio={aspectRatio}
        >
          {/* Slide content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            {/* Image background if present */}
            {slide.image && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div 
                  className="absolute inset-0"
                  style={{ backgroundColor: `${tokens.primary}30` }}
                />
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 text-center">
              <h2 
                className="text-xl font-bold mb-4 leading-tight"
                style={{ 
                  fontFamily: tokens.title,
                  color: txtColor,
                  fontSize: slide.fontSize === 'lg' ? '1.5rem' : slide.fontSize === 'sm' ? '1rem' : '1.25rem'
                }}
              >
                {slide.title}
              </h2>
              <p 
                className="text-sm leading-relaxed"
                style={{ 
                  fontFamily: tokens.body,
                  color: txtColor,
                  opacity: 0.9
                }}
              >
                {slide.content}
              </p>
              {slide.cta && (
                <button 
                  className="mt-6 px-6 py-2 text-sm font-semibold rounded-full"
                  style={{ 
                    backgroundColor: tokens.primary,
                    color: '#fff',
                    fontFamily: tokens.body
                  }}
                >
                  {slide.cta}
                </button>
              )}
            </div>
          </div>

          {/* Brand overlay */}
          {brandOverlay && (
            <div 
              className="absolute bottom-0 left-0 right-0 py-3 px-4 flex items-center justify-center"
              style={{ backgroundColor: tokens.primary }}
            >
              <span 
                className="text-xs font-medium text-white tracking-wider uppercase"
                style={{ fontFamily: tokens.body }}
              >
                ✦ Heldonica
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Edit controls */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="px-3 py-2 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
          ✏️ Titre
        </button>
        <button className="px-3 py-2 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
          🎨 Style
        </button>
        <button className="px-3 py-2 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
          🖼️ Image
        </button>
      </div>
    </div>
  )
}