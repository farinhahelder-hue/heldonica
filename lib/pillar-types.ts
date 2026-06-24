export interface PillarData {
  slug: string
  name: string
  country: string
  flag: string
  hero: string
  tagline: string
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
}
