import type { Metadata } from 'next'
import TravelPlanningClient from './TravelPlanningClient'

export const metadata: Metadata = {
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
        url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=85',
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
    images: ['https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=85'],
  },
}

export default function TravelPlanningPage() {
  return <TravelPlanningClient />
}
