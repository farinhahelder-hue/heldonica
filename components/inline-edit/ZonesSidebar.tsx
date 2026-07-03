'use client'

import { useState } from 'react'
import { useEditableContext } from './InlineEditProvider'

export default function ZonesSidebar({ page }: { page?: string }) {
  const { isEditing, registeredZones, zones } = useEditableContext()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  if (!isEditing) return null

  const filteredZones = registeredZones.filter((z) => {
    const term = search.toLowerCase()
    return z.key.toLowerCase().includes(term) || z.fallback.toLowerCase().includes(term)
  })

  const handleZoneClick = (key: string) => {
    // Key matches `${page}__${zone}`
    const el = document.getElementById(`zone-${key}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('animate-highlight-ring')
      setTimeout(() => {
        el.classList.remove('animate-highlight-ring')
      }, 2000)
    }
  }

  return (
    <>
      {/* Sidebar toggle button (floats right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-22 right-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-2xl hover:bg-stone-800 transition"
        title="Liste des zones modifiables"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-stone-50 border-l border-stone-200 z-[9998] shadow-2xl flex flex-col transition-all duration-300 pointer-events-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-100">
          <h3 className="font-serif font-bold text-stone-900 text-lg">Zones Modifiables</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-stone-500 hover:text-stone-800 transition text-sm font-semibold"
          >
            Fermer
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-200">
          <input
            type="text"
            placeholder="Rechercher une zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-eucalyptus"
          />
        </div>

        {/* Zones List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredZones.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-8">Aucune zone trouvée</p>
          ) : (
            filteredZones.map((z) => {
              const hasCmsValue = zones[z.key] !== undefined
              const displayVal = zones[z.key] || z.fallback
              const valPreview =
                displayVal.length > 20 ? displayVal.substring(0, 20) + '...' : displayVal

              return (
                <button
                  key={z.key}
                  onClick={() => handleZoneClick(z.key)}
                  className="w-full text-left p-3 rounded-xl border border-stone-200 bg-white hover:border-eucalyptus hover:shadow-sm transition group"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="font-mono text-xs text-stone-600 font-semibold break-all">
                      {z.key.split('__')[1]}
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
                  <p className="text-xs text-stone-400 group-hover:text-stone-600 transition truncate">
                    {valPreview || <em className="text-stone-300">Vide</em>}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
