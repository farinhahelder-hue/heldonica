import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'

export const metadata: Metadata = {
  title: 'Paris slow travel | Guide Heldonica',
  description: "Paris et l'Île-de-France se lisent mieux quand on sort des grandes phrases. Un canal, une friche, une rue, et le rythme change.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/paris' },
  openGraph: {
    title: 'Paris slow travel | Guide Heldonica',
    description: "Paris et l'Île-de-France se lisent mieux quand on sort des grandes phrases. Un canal, une friche, une rue, et le rythme change.",
    url: 'https://www.heldonica.fr/destinations/paris',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', width: 1200, height: 630, alt: 'Paris slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paris slow travel | Guide Heldonica',
    description: "Paris et l'Île-de-France se lisent mieux quand on sort des grandes phrases.",
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80'],
    creator: '@heldonica',
  },
}

export default function ParisPage() {
  return <DestinationPage slug="paris" />
}
