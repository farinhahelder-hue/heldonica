import type { Metadata } from 'next'
import TravelPlanningClient from './TravelPlanningClient'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: 'Travel Planning sur mesure | Heldonica',
  description: 'On conçoit ton voyage slow travel sur mesure — itinéraire terrain, hébergements testés et suivi humain. Formules à partir de 250€. Devis gratuit.',
  alternates: {
    canonical: 'https://www.heldonica.fr/travel-planning',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/travel-planning',
    title: 'Travel Planning sur mesure | Heldonica',
    description: 'Itinéraire terrain, adresses testées, suivi WhatsApp. On conçoit ton voyage slow travel. Devis gratuit.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Planning sur mesure — Heldonica',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Planning sur mesure | Heldonica',
    description: 'Itinéraire terrain, adresses testées, suivi WhatsApp. On conçoit ton voyage slow travel. Devis gratuit.',
    creator: '@heldonica',
    images: ['/og-default.jpg'],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('travel-planning', metadata)
}


export default async function TravelPlanningPage() {
  // Chargées ici plutôt que dans le client : le premier rendu porte déjà les
  // valeurs CMS, sans changement de texte après hydratation.
  const zones = await getPageZones('travel-planning')
  return <TravelPlanningClient initialZones={zones} />
}
