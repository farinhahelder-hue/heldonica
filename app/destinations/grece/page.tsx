import type { Metadata } from 'next'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: 'Grèce slow travel | Guide Heldonica — Bientôt',
  description: "Archipels discrets, villages calcaires, tavernes de port. Notre guide Grèce slow travel arrive prochainement — sois notifié en avant-première.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/grece' },
  openGraph: {
    title: 'Grèce slow travel | Guide Heldonica — Bientôt',
    description: "Archipels discrets, villages calcaires, tavernes de port. Notre guide Grèce slow travel arrive prochainement.",
    url: 'https://www.heldonica.fr/destinations/grece',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Grèce — Heldonica' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@heldonica', title: 'Grèce slow travel | Guide Heldonica — Bientôt', description: "Notre guide Grèce slow travel arrive prochainement." },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-grece', metadata)
}


export default async function GrecePage() {
  const zones = await getPageZones('destinations-grece')

  return (
    <ComingSoonDestination
      slug="grece"
      title="Grèce"
      country="Grèce"
      flag_emoji="🏛️"
      teaser="Archipels discrets, chapelles blanchies à la chaux, tavernes de port où personne ne parle anglais. La Grèce qu'on prépare, c'est celle d'avant les foules."
      hero_unsplash_url="/og-default.jpg"
      travel_style="slow-culture"
      best_season="Avril – juin · Septembre – octobre"
      avg_budget_couple_week={1400}
      zones={zones}
    />
  )
}
