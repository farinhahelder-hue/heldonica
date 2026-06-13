'use client'

import { useState } from 'react'
import { SlideData } from './tokens'

interface CaptionGeneratorProps {
  topic: string
  destination?: string
  slides?: SlideData[]
  defaultHashtags?: string
  onCaptionGenerated?: (caption: string, hashtags: string[]) => void
}

type Style = 'narratif' | 'informatif' | 'inspirant'

const TONE_LABELS = {
  narratif: { icon: '📖', label: 'Narratif' },
  informatif: { icon: '📝', label: 'Informatif' },
  inspirant: { icon: '✨', label: 'Inspirant' },
}

export default function CaptionGenerator({ topic, destination, slides = [], defaultHashtags, onCaptionGenerated }: CaptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [caption, setCaption] = useState('')
  const [editableCaption, setEditableCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [style, setStyle] = useState<Style>('narratif')
  const [copied, setCopied] = useState<'caption' | 'hashtags' | 'all' | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setCopied(null)

    try {
      const res = await fetch('/api/cms/carousel-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          destination, 
          slides: slides.map(s => ({ title: s.title, content: s.content })),
          style,
          defaultHashtags 
        })
      })

      const data = await res.json()

      if (data.success) {
        setCaption(data.caption)
        setEditableCaption(data.caption)
        setHashtags(data.hashtags)
        onCaptionGenerated?.(data.caption, data.hashtags)
      }
    } catch (err) {
      console.error('Caption generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'caption' | 'hashtags' | 'all') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Copy error:', err)
    }
  }

  const copyCaption = () => copyToClipboard(editableCaption, 'caption')
  const copyHashtags = () => copyToClipboard(hashtags.join(' '), 'hashtags')
  const copyAll = () => copyToClipboard(`${editableCaption}\n\n${hashtags.join(' ')}`, 'all')

  const charCount = editableCaption.length

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-[#83C5BE] to-[#4a7c59]">
        <h3 className="font-semibold text-white text-sm">✍️ Générateur Caption Instagram</h3>
        <p className="text-xs text-white/80">Ton Heldonica + hashtags optimisés</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Tone selector */}
        <div>
          <label className="text-xs font-medium text-stone-600 mb-2 block">Ton de la légende</label>
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            {(Object.keys(TONE_LABELS) as Style[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1 ${
                  style === s
                    ? 'bg-white shadow text-[#6b2a1a] font-medium'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {TONE_LABELS[s].icon}
              </button>
            ))}
          </div>
        </div>

        {/* Topic info */}
        <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-lg p-2">
          <span className="font-medium">Sujet:</span>
          <span className="truncate flex-1">{topic || 'Non défini'}</span>
          {destination && <><span className="mx-1">•</span><span>📍 {destination}</span></>}
          {slides.length > 0 && <><span className="mx-1">•</span><span>{slides.length} slides</span></>}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic}
          className="w-full px-4 py-3 text-sm bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Génération...
            </span>
          ) : (
            '✨ Générer caption + hashtags'
          )}
        </button>

        {/* Caption preview with edit */}
        {caption && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={editableCaption}
                onChange={(e) => setEditableCaption(e.target.value)}
                rows={6}
                className="w-full p-3 bg-stone-50 rounded-xl text-sm text-stone-700 whitespace-pre-wrap resize-none border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#83C5BE]/30"
              />
              <button
                onClick={copyCaption}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
              >
                {copied === 'caption' ? '✓ Copié!' : 'Copier'}
              </button>
            </div>

            {/* Character counter */}
            <div className="flex justify-between items-center text-xs">
              <span className={charCount > 2200 ? 'text-red-500' : charCount > 2000 ? 'text-orange-500' : 'text-stone-400'}>
                {charCount} / 2200 caractères
              </span>
              {charCount > 2200 && <span className="text-red-500">⚠️ Trop long</span>}
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-600">
                  Hashtags ({hashtags.length})
                </span>
                <button
                  onClick={copyHashtags}
                  className="text-xs text-[#83C5BE] hover:text-[#4a7c59] transition-colors"
                >
                  {copied === 'hashtags' ? '✓ Copié!' : 'Copier tous'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-[#83C5BE]/10 text-[#4a7c59] text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Copy all button */}
            <button
              onClick={copyAll}
              className="w-full px-4 py-2 text-sm border border-[#83C5BE] text-[#83C5BE] rounded-xl hover:bg-[#83C5BE]/10 transition-colors flex items-center justify-center gap-2"
            >
              📋 Copier caption + hashtags
              {copied === 'all' && <span className="text-[#4a7c59]">✓</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}