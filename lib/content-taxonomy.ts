// Content Taxonomy - Structure du site Heldonica
// Définit les catégories, types de contenu et taxonomies

export const CONTENT_TAXONOMY = {
  // Catégories principales
  categories: {
    destinations: {
      label: 'Destinations',
      description: 'Guides de voyage par destination',
      icon: '🗺️',
      color: '#1e40af',
      subcategories: ['villes', 'regions', 'iles', 'circuits'],
    },
    guides: {
      label: 'Guides pratiques',
      description: 'Conseils et bonnes pratiques',
      icon: '📘',
      color: '#065f46',
      subcategories: ['transport', 'hebergement', 'budget', 'sante', 'securite'],
    },
    food: {
      label: 'Gastronomie',
      description: 'Restaurants, plats locaux',
      icon: '🍽️',
      color: '#b45309',
      subcategories: ['restaurant', 'specialite', 'marche', 'vin'],
    },
    experiences: {
      label: 'Expériences',
      description: 'Activités et découvertes',
      icon: '✨',
      color: '#7c3aed',
      subcategories: ['rando', 'culturel', 'natur', 'insolite'],
    },
    stories: {
      label: 'Chroniques',
      description: 'Histoires et réflexions',
      icon: '📖',
      color: '#be185d',
      subcategories: ['couple', 'vie', 'expat'],
    },
  },

  // Styles de voyage
  travelStyles: [
    { id: 'slow-travel', label: 'Slow Travel', description: 'Voyager zen, prendre son temps', color: '#10b981' },
    { id: 'adventure', label: 'Aventure', description: 'Randonnée, sports outdoor', color: '#f59e0b' },
    { id: 'romantique', label: 'Romantique', description: 'Escapades à deux', color: '#ec4899' },
    { id: 'famille', label: 'Famille', description: 'Voyages en famille', color: '#3b82f6' },
    { id: 'solo', label: 'Solo', description: 'Voyage en solo', color: '#8b5cf6' },
    { id: 'gastronomie', label: 'Gastronomie', description: 'Food travel', color: '#f97316' },
    { id: 'digital-nomad', label: 'Digital Nomad', description: 'Télétravail', color: '#06b6d4' },
  ],

  // Saisons
  seasons: [
    { id: 'janvier', label: 'Janvier', emoji: '❄️' },
    { id: 'fevrier', label: 'Février', emoji: '🌨️' },
    { id: 'mars', label: 'Mars', emoji: '🌸' },
    { id: 'avril', label: 'Avril', emoji: '🌷' },
    { id: 'mai', label: 'Mai', emoji: '🌻' },
    { id: 'juin', label: 'Juin', emoji: '☀️' },
    { id: 'juillet', label: 'Juillet', emoji: '🔥' },
    { id: 'aout', label: 'Août', emoji: '🌞' },
    { id: 'septembre', label: 'Septembre', emoji: '🍇' },
    { id: 'octobre', label: 'Octobre', emoji: '🍁' },
    { id: 'novembre', label: 'Novembre', emoji: '🌧️' },
    { id: 'decembre', label: 'Décembre', emoji: '🎄' },
    { id: 'annee', label: 'Toute l\'année', emoji: '🌍' },
  ],

  // Niveaux de budget
  budgets: [
    { id: 'economique', label: 'Économique', range: ' < 80€/jour', color: '#84cc16' },
    { id: 'moyen', label: 'Moyen', range: '80-150€/jour', color: '#22c55e' },
    { id: 'haut-de-gamme', label: 'Haut de gamme', range: '150-300€/jour', color: '#f59e0b' },
    { id: 'luxe', label: 'Luxe', range: '> 300€/jour', color: '#ef4444' },
  ],

  // Pays常用
  countries: [
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', emoji: '🇵🇹' },
    { code: 'FR', name: 'France', flag: '🇫🇷', emoji: '🇫🇷' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸', emoji: '🇪🇸' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹', emoji: '🇮🇹' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭', emoji: '🇨🇭' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪', emoji: '🇩🇪' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪', emoji: '🇧🇪' },
    { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱', emoji: '🇳🇱' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', emoji: '🇬🇧' },
    { code: 'MA', name: 'Maroc', flag: '🇲🇦', emoji: '🇲🇦' },
    { code: 'GR', name: 'Grèce', flag: '🇬🇷', emoji: '🇬🇷' },
    { code: 'HR', name: 'Croatie', flag: '🇭🇷', emoji: '🇭🇷' },
  ],
} as const

// Type helper
export type ContentCategory = keyof typeof CONTENT_TAXONOMY.categories
export type TravelStyle = typeof CONTENT_TAXONOMY.travelStyles[number]['id']
export type Season = typeof CONTENT_TAXONOMY.seasons[number]['id']
export type Budget = typeof CONTENT_TAXONOMY.budgets[number]['id']

// Helpers
export function getCategoryColor(category: string): string {
  return CONTENT_TAXONOMY.categories[category as ContentCategory]?.color || '#666'
}

export function getTravelStyleLabel(style: string): string {
  return CONTENT_TAXONOMY.travelStyles.find(s => s.id === style)?.label || style
}

export function getCountryName(code: string): string {
  return CONTENT_TAXONOMY.countries.find(c => c.code === code)?.name || code
}