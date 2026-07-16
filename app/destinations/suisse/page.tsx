import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'

export const metadata: Metadata = {
  title: 'Suisse slow travel | Guide Heldonica',
  description: "Montagnes, lacs, trains impeccables et détours qui demandent du temps. La Suisse devient juste quand on cesse de la résumer à son prix.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/suisse' },
  openGraph: {
    title: 'Suisse slow travel | Guide Heldonica',
    description: "Montagnes, lacs, trains impeccables et détours qui demandent du temps. La Suisse devient juste quand on cesse de la résumer à son prix.",
    url: 'https://www.heldonica.fr/destinations/suisse',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', width: 1200, height: 630, alt: 'Suisse slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suisse slow travel | Guide Heldonica',
    description: "Montagnes, lacs, trains impeccables. La Suisse devient juste quand on cesse de la résumer à son prix.",
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'],
    creator: '@heldonica',
  },
}

export default function SuissePage() {
  return <DestinationPage slug="suisse" />
}
