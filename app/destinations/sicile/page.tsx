import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'

export const metadata: Metadata = {
  title: 'Sicile slow travel | Guide Heldonica',
  description: "Temples grecs, marchés bruyants, côte sauvage. La Sicile se révèle quand on ralentit — une île où chaque village raconte une civilisation différente.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/sicile' },
  openGraph: {
    title: 'Sicile slow travel | Guide Heldonica',
    description: "Temples grecs, marchés bruyants, côte sauvage. La Sicile se révèle quand on ralentit.",
    url: 'https://www.heldonica.fr/destinations/sicile',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Sicile slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sicile slow travel | Guide Heldonica',
    description: "Temples grecs, marchés bruyants, côte sauvage. La Sicile se révèle quand on ralentit.",
    images: ['/og-default.jpg'],
    creator: '@heldonica',
  },
}

export default function SicilePage() {
  return <DestinationPage slug="sicile" />
}