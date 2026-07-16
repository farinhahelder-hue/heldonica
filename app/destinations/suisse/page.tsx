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
    images: [{ url: 'https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg', width: 1200, height: 630, alt: 'Suisse slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suisse slow travel | Guide Heldonica',
    description: "Montagnes, lacs, trains impeccables. La Suisse devient juste quand on cesse de la résumer à son prix.",
    images: ['https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg'],
    creator: '@heldonica',
  },
}

export default function SuissePage() {
  return <DestinationPage slug="suisse" />
}
