'use client'

import { useState, useEffect } from 'react'

interface AiImproveModalProps {
  isOpen: boolean
  text: string
  zoneType: 'text' | 'textarea'
  onClose: () => void
  onSelect: (variant: string) => void
}

export default function AiImproveModal({
  isOpen,
  text,
  zoneType,
  onClose,
  onSelect,
}: AiImproveModalProps) {
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState<[string, string] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && text) {
      const generateSuggestions = async () => {
        setLoading(true)
        setError(null)
        setVariants(null)
        try {
          const res = await fetch('/api/cms/ai-improve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, zone_type: zoneType }),
          })
          const data = await res.json()
          if (data.success && data.variants) {
            setVariants(data.variants)
          } else {
            setError(data.error || 'Impossible de generer des suggestions')
          }
        } catch {
          setError('Erreur reseau lors de la generation')
        } finally {
          setLoading(false)
        }
      }
      generateSuggestions()
    }
  }, [isOpen, text, zoneType])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg">
              ✨ Suggestions Voix Heldonica
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              On applique les regles slow travel (anecdotes, sensoriel, tutoiement)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition text-xl font-bold p-1"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-eucalyptus border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-stone-600 animate-pulse">
                ✨ Generation en cours…
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {variants && (
            <div className="grid md:grid-cols-2 gap-6">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-eucalyptus transition space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-eucalyptus px-2 py-0.5 bg-eucalyptus/10 rounded-full">
                      Variante {index + 1}
                    </span>
                    <p className="text-sm text-stone-700 mt-3 whitespace-pre-wrap leading-relaxed">
                      {variant || <em className="text-stone-300">Vide</em>}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelect(variant)}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow transition"
                  >
                    Utiliser cette version
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 flex justify-end bg-stone-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-100 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
