'use client'

import { useState } from 'react'

type Mode = '1' | '2' | '3' | null

export default function CopilotePage() {
  const [mode, setMode] = useState<Mode>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const canLaunch = !!mode && message.trim().length > 0 && !loading

  async function lancer() {
    if (!canLaunch || !mode) return
    setLoading(true)
    setError(null)
    setReply(null)
    try {
      const res = await fetch('/api/ai/gemini-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setReply(data.reply)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function recommencer() {
    setMode(null)
    setMessage('')
    setReply(null)
    setError(null)
    setCopied(false)
  }

  async function copier() {
    if (!reply) return
    await navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#6B2D1F]">Copilote Heldonica</h1>
        <p className="text-sm text-stone-500 mt-1">Une seule action à la fois — 5/15/30 min — version énergie basse</p>
      </div>

      {/* Sélection mode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { id: '1' as const, label: 'Mode 1 — Contenu', desc: 'blog, carrousel, Reel, CMS, recycle' },
          { id: '2' as const, label: 'Mode 2 — Pilotage', desc: 'démarrage, planification, déblocage, bilan' },
          { id: '3' as const, label: 'Mode 3 — Site', desc: 'dev, audit, check, nettoyage' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              mode === m.id
                ? 'border-[#2D8B7A] bg-[#2D8B7A]/10'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="text-sm font-semibold text-stone-800">{m.label}</div>
            <div className="text-xs text-stone-500 mt-1">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Champ message */}
      <div className="mb-6">
        <label className="text-sm font-medium text-stone-700">Ton message</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canLaunch && lancer()}
          placeholder="ex: je ne sais pas quoi faire"
          className="mt-1 w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] focus:border-transparent"
        />
      </div>

      {/* Bouton lancer */}
      <button
        onClick={lancer}
        disabled={!canLaunch}
        className="w-full py-3 bg-[#2D8B7A] text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#257a6a] transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            En cours...
          </>
        ) : (
          'Lancer'
        )}
      </button>

      {/* Erreur */}
      {error && <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">{error}</div>}

      {/* Réponse */}
      {reply && (
        <div className="mt-8 p-5 bg-white border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-800">Ta prochaine action</h2>
            <div className="flex gap-2">
              <button
                onClick={copier}
                className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                {copied ? 'Copié ✓' : 'Copier'}
              </button>
              <button onClick={recommencer} className="text-xs px-3 py-1.5 text-stone-500 hover:text-stone-700">
                Recommencer
              </button>
            </div>
          </div>
          <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{reply}</div>
        </div>
      )}
    </div>
  )
}
