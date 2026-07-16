import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'

export const metadata: Metadata = {
  title: 'Zurich slow travel | Guide Heldonica',
  description: "Badi flottantes, brasseries artisanales et vieille ville dense. Zurich se révèle quand on ralentit assez pour la laisser venir.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/zurich' },
  openGraph: {
    title: 'Zurich slow travel | Guide Heldonica',
    description: "Badi flottantes, brasseries artisanales et vieille ville dense. Zurich se révèle quand on ralentit assez pour la laisser venir.",
    url: 'https://www.heldonica.fr/destinations/zurich',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg', width: 1200, height: 630, alt: 'Zurich slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zurich slow travel | Guide Heldonica',
    description: "Badi flottantes, brasseries artisanales et vieille ville dense. Zurich se révèle quand on ralentit.",
    images: ['https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg'],
    creator: '@heldonica',
  },
}

export default function ZurichPage() {
  return <DestinationPage slug="zurich" />
}
