'use client'

import { useState, useCallback } from 'react'
import { useEditableContext } from './InlineEditProvider'

interface HistoryEntry {
  id: string
  old_value: string | null
  new_value: string
  changed_at: string
}

function HistoryPanel({
  page,
  zoneKey,
  onRestore,
}: {
  page: string
  zoneKey: string
  onRestore: () => void
}) {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/cms/zone-history?page=${encodeURIComponent(page)}&zone_key=${encodeURIComponent(zoneKey)}`
      )
      const data = await res.json()
      setHistory(data.history ?? [])
    } finally {
      setLoading(false)
    }
  }, [page, zoneKey])

  if (history === null) {
    return (
      <button
        onClick={load}
        className="text-xs text-eucalyptus underline mt-1"
      >
        Voir l'historique
      </button>
    )
  }

  const restore = async (value: string, id: string) => {
    setRestoring(id)
    try {
      await fetch('/api/cms/zone-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, zone_key: zoneKey, value }),
      })
      onRestore()
    } finally {
      setRestoring(null)
    }
  }

  if (loading) return <p className="text-xs text-stone-400 mt-1 italic">Chargement…</p>

  if (history.length === 0) {
    return <p className="text-xs text-stone-400 mt-1 italic">Aucun historique</p>
  }

  return (
    <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-2">
      {history.map((h) => {
        const date = new Date(h.changed_at).toLocaleString('fr-FR', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        })
        const preview = h.new_value.length > 28 ? h.new_value.slice(0, 28) + '…' : h.new_value
        return (
          <div key={h.id} className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-stone-400 shrink-0">{date}</span>
            <span className="text-stone-600 truncate flex-1" title={h.new_value}>{preview}</span>
            <button
              onClick={() => restore(h.new_value, h.id)}
              disabled={restoring === h.id}
              className="shrink-0 text-eucalyptus font-bold hover:underline disabled:opacity-50"
            >
              {restoring === h.id ? '…' : '↺'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function ZonesSidebar({ page }: { page?: string }) {
  const { isEditing, registeredZones, zones, refresh } = useEditableContext()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  if (!isEditing) return null

  const filteredZones = registeredZones.filter((z) => {
    const term = search.toLowerCase()
    return z.key.toLowerCase().includes(term) || z.fallback.toLowerCase().includes(term)
  })

  const handleZoneClick = (key: string) => {
    const el = document.getElementById(`zone-${key}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('animate-highlight-ring')
      setTimeout(() => el.classList.remove('animate-highlight-ring'), 2000)
    }
  }

  const parsePageZone = (key: string) => {
    const sep = key.indexOf('__')
    if (sep === -1) return { p: page ?? '', z: key }
    return { p: key.slice(0, sep), z: key.slice(sep + 2) }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-2xl hover:bg-stone-800 transition"
        title="Liste des zones modifiables"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-stone-50 border-l border-stone-200 z-[9998] shadow-2xl flex flex-col transition-all duration-300 pointer-events-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-100">
          <h3 className="font-serif font-bold text-stone-900 text-lg">Zones</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-stone-500 hover:text-stone-800 transition text-sm font-semibold"
          >
            Fermer
          </button>
        </div>

        <div className="p-4 border-b border-stone-200">
          <input
            type="text"
            placeholder="Rechercher une zone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-eucalyptus"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredZones.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-8">Aucune zone trouvée</p>
          ) : (
            filteredZones.map((z) => {
              const hasCmsValue = zones[z.key] !== undefined
              const displayVal = zones[z.key] || z.fallback
              const valPreview = displayVal.length > 24 ? displayVal.slice(0, 24) + '…' : displayVal
              const { p, z: zk } = parsePageZone(z.key)
              const isExpanded = expandedKey === z.key

              return (
                <div
                  key={z.key}
                  className="rounded-xl border border-stone-200 bg-white hover:border-eucalyptus/40 transition"
                >
                  <button
                    onClick={() => handleZoneClick(z.key)}
                    className="w-full text-left p-3 group"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-mono text-xs text-stone-600 font-semibold break-all">
                        {zk}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                          hasCmsValue
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {hasCmsValue ? 'CMS' : 'Fallback'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 truncate">{valPreview}</p>
                  </button>

                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : z.key)}
                    className="w-full text-left px-3 pb-2 text-[10px] text-stone-400 hover:text-eucalyptus transition flex items-center gap-1"
                  >
                    <span>{isExpanded ? '▲' : '▼'}</span>
                    <span>Historique</span>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3">
                      <HistoryPanel
                        page={p}
                        zoneKey={zk}
                        onRestore={async () => {
                          await refresh()
                          setExpandedKey(null)
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
