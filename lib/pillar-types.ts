export interface PillarData {
  slug: string
  name: string
  country: string
  flag: string
  hero: string
  tagline: string
  heroSubtitle?: string
  budget: number
  season: string
  flight: string
  visa: string
  currency: string
  language: string
  seoTitle: string
  seoDesc: string
  intro: string[]
  infoTable: { label: string; value: string }[]
  itinerary: { day: number; title: string; activities: string[]; tip?: string; articleSlug?: string }[]
  budgetBreakdown: { label: string; pct: number; amount: number }[]
  faq: { q: string; a: string }[]
  /**
   * Où dormir, par type de séjour. Piloté par le CMS (`cms_pillar_pages.accommodations`).
   * Vide tant qu'on n'a pas de recommandation réellement testée : la section
   * disparaît plutôt que d'afficher du remplissage générique.
   */
  accommodations: {
    /** 'charme' | 'nature' | 'budget' — sert de clé d'affichage. */
    type: string
    label: string
    description: string
    /** Ville ou zone à chercher sur Booking. Défaut : le nom de la destination. */
    searchQuery?: string
  }[]
  testedByHeldonica?: {
    when: string
    duration: string
    withWho: string
    highlights: string[]
    keyInsight: string
  }
  verdict?: {
    score: number
    forWho: string
    strengths: string[]
    considerations: string[]
    finalWord: string
  }
}
