'use client'

import { useState } from 'react'
import { SlideData } from './tokens'

// Tes notes → des diapositives. Ce panneau était un « chat IA » avec des
// gabarits « Top {n} endroits pour {activité} à {destination} », « Les secrets
// de {sujet} que personne ne vous dit » : une invitation à inventer, et sans
// clé OpenAI la route rendait des slogans à trous. Ici : un seul champ, tes
// notes en vrac ; l'assistant découpe et resserre, et la route signale tout
// chiffre qu'il aurait ajouté.

interface AIChatPanelProps {
  onSlidesGenerated: (slides: SlideData[]) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
}

type Resultat =
  | { ok: true; nb: number; fournisseur?: string; voix?: { score: number; mots_bannis: string[] }; ajouts: string[] }
  | { ok: false; erreur: string }

const NOTES_MIN = 80

export default function AIChatPanel({ onSlidesGenerated, isGenerating, setIsGenerating }: AIChatPanelProps) {
  const [notes, setNotes] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [resultat, setResultat] = useState<Resultat | null>(null)

  const decouper = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isGenerating || notes.trim().length < NOTES_MIN) return
    setIsGenerating(true)
    setResultat(null)
    try {
      const res = await fetch('/api/cms/carousel-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim(), slideCount }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.slides?.length) {
        setResultat({ ok: false, erreur: data.error || `L'assistant n'a pas répondu (HTTP ${res.status}).` })
        return
      }
      onSlidesGenerated(data.slides)
      setResultat({
        ok: true,
        nb: data.slides.length,
        fournisseur: data.meta?.fournisseur,
        voix: data.meta?.voix,
        ajouts: data.meta?.ajouts_non_sources ?? [],
      })
    } catch (err) {
      setResultat({ ok: false, erreur: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsGenerating(false)
    }
  }

  const manque = Math.max(0, NOTES_MIN - notes.trim().length)

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200">
        <h3 className="font-semibold text-stone-800 text-sm">Tes notes → diapositives</h3>
        <p className="text-xs text-stone-500 mt-0.5">
          L&apos;assistant découpe et resserre ce que tu as écrit. Il n&apos;ajoute ni lieu, ni chiffre, ni sensation.
        </p>
      </div>

      <form onSubmit={decouper} className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isGenerating}
          placeholder={'En vrac : où on était, à quelle heure, ce qu\'on a vu, mangé, ce qui a raté, ce qu\'on a moins aimé. Une idée par ligne, c\'est parfait.'}
          className="flex-1 min-h-[160px] w-full resize-none rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] disabled:bg-stone-100"
        />
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className={manque > 0 ? 'text-stone-400' : 'text-[#2D8B7A]'}>
            {manque > 0 ? `encore ${manque} caractère${manque > 1 ? 's' : ''}` : `${notes.trim().length} caractères`}
          </span>
          <label className="flex items-center gap-2">
            <span>Diapositives</span>
            <input
              type="range"
              min={2}
              max={10}
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              disabled={isGenerating}
              className="w-24 accent-[#4a7c59]"
            />
            <span className="w-5 font-medium text-stone-700">{slideCount}</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={isGenerating || manque > 0}
          className="w-full rounded-full bg-[#4a7c59] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d6749] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Découpage…' : 'Découper en diapositives'}
        </button>

        {resultat && !resultat.ok && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{resultat.erreur}</div>
        )}
        {resultat && resultat.ok && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 space-y-1">
            <div>
              {resultat.nb} diapositive{resultat.nb > 1 ? 's' : ''} depuis tes notes
              {resultat.voix && ` · voix ${resultat.voix.score}/100`}
              {resultat.voix && resultat.voix.mots_bannis.length > 0 && ` · mots bannis : ${resultat.voix.mots_bannis.join(', ')}`}
            </div>
            {resultat.ajouts.length > 0 ? (
              <div className="text-amber-900">
                L&apos;assistant avait ajouté un chiffre absent de tes notes ({resultat.ajouts.join(', ')}) : la diapositive concernée porte un [À TOI].
              </div>
            ) : (
              <div className="text-stone-500">Aucun chiffre ajouté. Relis quand même : c&apos;est toi qui publies.</div>
            )}
          </div>
        )}
        <p className="text-[11px] text-stone-400">
          Sans IA : « Coller un texte », à droite, découpe ligne par ligne.
        </p>
      </form>
    </div>
  )
}
