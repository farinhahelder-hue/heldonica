'use client'

import { useEffect, useState } from 'react'

type Moment = { heure: string; count: number; files: string[] }

export default function EtudePage() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [voyage, setVoyage] = useState('')
  const [loading, setLoading] = useState(true)
  const [ai, setAi] = useState<Record<string, string>>({})
  const [atois, setAtois] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/cms/etude')
      .then(r => r.json())
      .then(d => {
        setMoments(d.moments || [])
        setVoyage(d.voyage || '')
      })
      .finally(() => setLoading(false))
  }, [])

  async function decrire(heure: string) {
    setAi(a => ({ ...a, [heure]: 'Analyse...' }))
    try {
      const res = await fetch('/api/ai/gemini-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: '1', message: `Décris ce moment ${heure} sans inventer de lieu, juste matières/lumière/sons (regard TSA)` }),
      })
      const data = await res.json()
      setAi(a => ({ ...a, [heure]: data.reply || data.error || '—' }))
    } catch (e) {
      setAi(a => ({ ...a, [heure]: String(e) }))
    }
  }

  if (loading) return <div className="p-8 text-stone-500">Chargement moments...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#6B2D1F]">Étude photos — par moments</h1>
      <p className="text-sm text-stone-500 mt-1">1 moment = 1 action de 5 min. Pas besoin de tout faire.</p>

      <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs whitespace-pre-wrap max-h-48 overflow-auto">
        {voyage.slice(0, 2000)}
      </div>

      <div className="mt-6 space-y-4">
        {moments.map(m => (
          <div key={m.heure} className="p-4 bg-white border border-stone-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-stone-800">
                {m.heure} — {m.count} photos
              </div>
              <button
                onClick={() => decrire(m.heure)}
                className="text-xs px-3 py-1.5 bg-[#2D8B7A] text-white rounded-lg hover:bg-[#257a6a]"
              >
                Décrire ce moment
              </button>
            </div>

            {ai[m.heure] && <div className="mt-3 p-3 bg-[#2D8B7A]/10 rounded-lg text-sm whitespace-pre-wrap">{ai[m.heure]}</div>}

            <div className="mt-3">
              <label className="text-xs font-medium text-stone-600">[A TOI : où, quoi, moins aimé]</label>
              <textarea
                value={atois[m.heure] || ''}
                onChange={e => setAtois(a => ({ ...a, [m.heure]: e.target.value }))}
                placeholder="Ex: terrasse à l'ombre, café filtre, trop de monde à 14h"
                className="mt-1 w-full p-2 border border-stone-200 rounded-lg text-sm"
                rows={2}
              />
            </div>
          </div>
        ))}
        {moments.length === 0 && <p className="text-sm text-stone-400">Aucun moment trouvé — vérifie imports/roumanie-2026/voyage.md</p>}
      </div>
    </div>
  )
}
