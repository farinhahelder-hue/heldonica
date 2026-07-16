'use client'

import { useState } from 'react'

export interface SeasonData {
  name: string
  emoji: string
  months: string[]
  weather: string
  crowd: 'low' | 'medium' | 'high'
  price: 'low' | 'medium' | 'high'
  description: string
}

export interface SeasonalTableProps {
  destination: string
  seasons: SeasonData[]
}

const crowdLabels = {
  low: { label: 'Faible', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Modéré', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Élevé', color: 'bg-red-100 text-red-700' },
}

const priceLabels = {
  low: { label: '€', color: 'text-emerald-600' },
  medium: { label: '€€', color: 'text-amber-600' },
  high: { label: '€€€', color: 'text-red-600' },
}

export default function SeasonalTable({ destination, seasons }: SeasonalTableProps) {
  const [selectedSeason, setSelectedSeason] = useState<SeasonData | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
        <h3 className="text-lg font-serif font-bold text-stone-900">
          📅 Meilleure période pour {destination}
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          Clique sur une saison pour voir le détail
        </p>
      </div>

      {/* Seasons grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
        {seasons.map((season, index) => (
          <button
            key={index}
            onClick={() => setSelectedSeason(season)}
            className={`p-5 text-left transition-all hover:bg-stone-50 ${
              selectedSeason?.name === season.name ? 'bg-amber-50 ring-2 ring-amber-200' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{season.emoji}</span>
              <span className="font-semibold text-stone-900">{season.name}</span>
            </div>
            <p className="text-xs text-stone-500 mb-3">{season.months.join(', ')}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${crowdLabels[season.crowd].color}`}>
                Foule {crowdLabels[season.crowd].label}
              </span>
              <span className={`font-semibold ${priceLabels[season.price].color}`}>
                {priceLabels[season.price].label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selectedSeason && (
        <div className="border-t border-stone-200 p-6 bg-amber-50/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-2xl mr-2">{selectedSeason.emoji}</span>
              <h4 className="text-xl font-serif font-bold text-stone-900 inline">
                {selectedSeason.name}
              </h4>
              <p className="text-sm text-stone-500 mt-1">{selectedSeason.months.join(', ')}</p>
            </div>
            <button
              onClick={() => setSelectedSeason(null)}
              className="text-stone-400 hover:text-stone-600 p-1"
              aria-label="Fermer"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Météo</p>
              <p className="text-sm text-stone-700">{selectedSeason.weather}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Affluence</p>
              <p className={`text-sm font-semibold ${
                selectedSeason.crowd === 'low' ? 'text-emerald-600' :
                selectedSeason.crowd === 'medium' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {crowdLabels[selectedSeason.crowd].label}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Budget</p>
              <p className={`text-sm font-semibold ${priceLabels[selectedSeason.price].color}`}>
                {selectedSeason.price === 'low' ? 'Économique' :
                 selectedSeason.price === 'medium' ? 'Intermédiaire' : 'Premium'}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-stone-600 leading-relaxed">
            {selectedSeason.description}
          </p>
        </div>
      )}
    </div>
  )
}
