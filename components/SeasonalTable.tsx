'use client'

import { useState } from 'react'

interface SeasonData {
  name: string
  emoji: string
  months: string[]
  weather: string
  crowd: 'low' | 'medium' | 'high'
  price: 'low' | 'medium' | 'high'
  description: string
}

interface SeasonalTableProps {
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
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Météo</p>
              <p className="text-sm text-stone-700">{selectedSeason.weather}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Affluence</p>
              <p className={`text-sm font-semibold ${
                selectedSeason.crowd === 'low' ? 'text-emerald-600' :
                selectedSeason.crowd === 'medium' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {crowdLabels[selectedSeason.crowd].label}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Budget</p>
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

// Données pré-remplies pour les destinations principales
export const MADEIRA_SEASONS: SeasonData[] = [
  {
    name: 'Printemps',
    emoji: '🌸',
    months: ['Mars', 'Avril', 'Mai'],
    weather: '16-22°C, fleurs, végétation vive',
    crowd: 'low',
    price: 'medium',
    description: 'La période reine pour Madère. Floraisons,气温 agréables, randos idéales. Prix encore modérés avant la haute saison.',
  },
  {
    name: 'Été',
    emoji: '☀️',
    months: ['Juin', 'Juillet', 'Août'],
    weather: '22-28°C, mer chaude, soleil',
    crowd: 'high',
    price: 'high',
    description: 'Pic d\'affluence et prix élevés. Parfait pour la plage et les activités nautiques. Réservez longtemps à l\'avance.',
  },
  {
    name: 'Automne',
    emoji: '🍂',
    months: ['Septembre', 'Octobre', 'Novembre'],
    weather: '18-24°C, fin de l\'été indien',
    crowd: 'medium',
    price: 'medium',
    description: 'Excellent compromis : chaleur encore présente, moins de monde, prix en baisse. Notre recommandation pour un premier voyage.',
  },
  {
    name: 'Hiver',
    emoji: '🌧️',
    months: ['Décembre', 'Janvier', 'Février'],
    weather: '14-20°C, plus humide, brumeux',
    crowd: 'low',
    price: 'low',
    description: 'Version contemplatif de Madère. Moins de randos praticables (boue), mais ambiance unique et prix cassés.',
  },
]

export const MONTENEGRO_SEASONS: SeasonData[] = [
  {
    name: 'Printemps',
    emoji: '🌷',
    months: ['Avril', 'Mai', 'Juin'],
    weather: '18-26°C, idéal pour rando',
    crowd: 'low',
    price: 'low',
    description: 'Températures agréables, nature en pleine croissance, sites historiques moins bondés. La meilleure période pour explorer.',
  },
  {
    name: 'Été',
    emoji: '🏖️',
    months: ['Juillet', 'Août'],
    weather: '25-32°C, plage, festivals',
    crowd: 'high',
    price: 'high',
    description: 'Haute saison avec affluence maximale sur la côte. Ambiance festive, plages热闹, mais réserver tout à l\'avance.',
  },
  {
    name: 'Automne',
    emoji: '🍁',
    months: ['Septembre', 'Octobre'],
    weather: '18-24°C, vendanges, couleurs',
    crowd: 'medium',
    price: 'medium',
    description: 'Notre coup de cœur : mer encore chaude, villages viticoles en couleurs, calme revenu. Parfait pour le slow travel.',
  },
  {
    name: 'Hiver',
    emoji: '❄️',
    months: ['Novembre', 'Décembre', 'Janvier', 'Février', 'Mars'],
    weather: '5-12°C, neige dans les montagnes',
    crowd: 'low',
    price: 'low',
    description: 'Saison basse pour le tourisme晒日光浴 mais idéale pour le lac de Skadar, les Balkans intérieurs et lesrandos en montagne.',
  },
]

export const ROUMANIE_SEASONS: SeasonData[] = [
  {
    name: 'Printemps',
    emoji: '🌿',
    months: ['Avril', 'Mai', 'Juin'],
    weather: '12-22°C, transylvanie en fleurs',
    crowd: 'medium',
    price: 'low',
    description: 'Bucovina accessible, champs de fleurs sauvages, températures agréables pour explorer. Prix encore doux.',
  },
  {
    name: 'Été',
    emoji: '☀️',
    months: ['Juillet', 'Août'],
    weather: '20-30°C, festivals, chaleur',
    crowd: 'high',
    price: 'medium',
    description: 'Festivals暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热暑热. Attention à la chaleur à Bucarest.',
  },
  {
    name: 'Automne',
    emoji: '🍂',
    months: ['Septembre', 'Octobre', 'Novembre'],
    weather: '8-18°C, feuilles colorées, vendanges',
    crowd: 'low',
    price: 'low',
    description: 'La Transylvanie en couleurs est un cauchemar photographique. Vendanges dans les vignobles, calme idéal.',
  },
  {
    name: 'Hiver',
    emoji: '❄️',
    months: ['Décembre', 'Janvier', 'Février', 'Mars'],
    weather: '-5 à 5°C, neige, marchés de Noël',
    crowd: 'medium',
    price: 'low',
    description: 'Marchés de Noël féériques, neige sur les châteaux, chaleur des auberges. La Transylvanie enneigée, c\'est magique.',
  },
]