import type { Metadata } from 'next'
import ComingSoonDestination from '@/components/ComingSoonDestination'

export const metadata: Metadata = {
  title: 'Grèce slow travel | Guide Heldonica — Bientôt',
  description: "Archipels discrets, villages calcaires, tavernes de port. Notre guide Grèce slow travel arrive prochainement — sois notifié en avant-première.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/grece' },
  openGraph: {
    title: 'Grèce slow travel | Guide Heldonica — Bientôt',
    description: "Archipels discrets, villages calcaires, tavernes de port. Notre guide Grèce slow travel arrive prochainement.",
    url: 'https://www.heldonica.fr/destinations/grece',
    images: [{ url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', width: 1200, height: 630, alt: 'Grèce — Heldonica' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@heldonica', title: 'Grèce slow travel | Guide Heldonica — Bientôt', description: "Notre guide Grèce slow travel arrive prochainement." },
}

export default function GrecePage() {
  return (
    <ComingSoonDestination
      slug="grece"
      title="Grèce"
      country="Grèce"
      flag_emoji="🏛️"
      teaser="Archipels discrets, chapelles blanchies à la chaux, tavernes de port où personne ne parle anglais. La Grèce qu'on prépare, c'est celle d'avant les foules."
      hero_unsplash_url="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80"
      travel_style="slow-culture"
      best_season="Avril – juin · Septembre – octobre"
      avg_budget_couple_week={1400}
    />
  )
}
