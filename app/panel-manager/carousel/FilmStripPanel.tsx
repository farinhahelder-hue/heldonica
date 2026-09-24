'use client'

import { useState } from 'react'
import { SlideData, HELDONICA_TOKENS } from './tokens'
import { exportAllSlides } from '@/lib/carousel/export'

interface FilmStripPanelProps {
  slides: SlideData[]
  activeSlideId: string | null
  onSlideSelect: (id: string) => void
  onSlidesReorder: (slides: SlideData[]) => void
  onSlideDelete: (id: string) => void
  onSlideAdd: () => void
  getSlideElement?: (index: number) => HTMLElement | null
}

export default function FilmStripPanel({ 
  slides, 
  activeSlideId, 
  onSlideSelect, 
  onSlidesReorder, 
  onSlideDelete,
  onSlideAdd,
  getSlideElement 
}: FilmStripPanelProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [isExportingAll, setIsExportingAll] = useState(false)

  const handleExportAll = async () => {
    if (!getSlideElement || slides.length === 0) return
    setIsExportingAll(true)
    try {
      const elements = slides.map((_, i) => getSlideElement(i)).filter(Boolean) as HTMLElement[]
      if (elements.length === slides.length) {
        await exportAllSlides(elements, 'heldonica-slide')
      }
    } catch (err) {
      console.error('Export all error:', err)
    } finally {
      setIsExportingAll(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedId && id !== draggedId) {
      setDragOverId(id)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const newSlides = [...slides]
    const draggedIndex = newSlides.findIndex(s => s.id === draggedId)
    const targetIndex = newSlides.findIndex(s => s.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newSlides.splice(draggedIndex, 1)
      newSlides.splice(targetIndex, 0, removed)
      onSlidesReorder(newSlides)
    }

    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-800 text-sm">🎞️ Filmstrip</h3>
          <p className="text-xs text-stone-500">{slides.length} slides</p>
        </div>
        <button
          onClick={onSlideAdd}
          className="px-3 py-1.5 text-xs bg-[#4a7c59] text-white rounded-lg hover:bg-[#4a7c59]/90 transition-colors"
        >
          + Slide
        </button>
      </div>

      {/* Filmstrip */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, slide.id)}
            onDragOver={(e) => handleDragOver(e, slide.id)}
            onDrop={(e) => handleDrop(e, slide.id)}
            onDragEnd={handleDragEnd}
            onClick={() => onSlideSelect(slide.id)}
            className={`
              relative p-3 rounded-xl cursor-pointer transition-all
              ${activeSlideId === slide.id 
                ? 'ring-2 ring-[#6b2a1a] bg-[#6b2a1a]/5' 
                : 'bg-stone-50 hover:bg-stone-100'
              }
              ${dragOverId === slide.id ? 'ring-2 ring-[#83C5BE]' : ''}
              ${draggedId === slide.id ? 'opacity-50' : ''}
            `}
          >
            {/* Slide number */}
            <div 
              className="absolute -left-1 -top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: HELDONICA_TOKENS.colors.primary }}
            >
              {index + 1}
            </div>

            {/* Drag handle */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 cursor-grab">
              ⠿
            </div>

            {/* Slide preview thumbnail */}
            <div 
              className="w-full aspect-square rounded-lg mb-2 bg-cover bg-center flex items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: slide.backgroundColor || HELDONICA_TOKENS.colors.background,
                backgroundImage: slide.image ? `url(${slide.image})` : 'none',
              }}
            >
              {!slide.image && (
                <span className="text-2xl opacity-30">📷</span>
              )}
              <div 
                className="absolute inset-0 flex items-center justify-center p-2"
                style={{ backgroundColor: slide.backgroundColor ? `${slide.backgroundColor}80` : 'transparent' }}
              >
                <p className="text-xs text-center font-medium line-clamp-2" style={{ color: slide.textColor || HELDONICA_TOKENS.colors.text }}>
                  {slide.title || 'Sans titre'}
                </p>
              </div>
            </div>

            {/* Slide title */}
            <p className="text-xs font-medium text-stone-700 truncate pr-6">
              {slide.title || `Slide ${index + 1}`}
            </p>

            {/* Delete button */}
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSlideDelete(slide.id)
                }}
                className="absolute right-1 bottom-1 w-5 h-5 rounded-full bg-stone-200 text-stone-500 text-xs hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add slide card */}
        <button
          onClick={onSlideAdd}
          className="w-full p-4 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-[#83C5BE] hover:text-[#83C5BE] transition-colors"
        >
          <div className="text-xl mb-1">+</div>
          <span className="text-xs">Ajouter slide</span>
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-3 border-t border-stone-200 bg-stone-50">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors">
            📋 Dupliquer
          </button>
          <button 
            onClick={handleExportAll}
            disabled={isExportingAll || slides.length === 0}
            className="flex-1 px-3 py-2 text-xs bg-[#6b2a1a] text-white rounded-lg hover:bg-[#6b2a1a]/90 transition-colors disabled:opacity-50"
          >
            {isExportingAll ? '...' : '📦'} ZIP ({slides.length})
          </button>
        </div>
      </div>
    </div>
  )
}