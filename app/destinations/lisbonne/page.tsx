import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'

export const metadata: Metadata = {
  title: 'Lisbonne slow travel | Guide Heldonica',
  description: "Alfama, Mouraria, miradouros et trams en pente. Lisbonne se ralentit facilement — c'est une ville qui se donne à ceux qui traînent.",
  alternates: { canonical: 'https://www.heldonica.fr/destinations/lisbonne' },
  openGraph: {
    title: 'Lisbonne slow travel | Guide Heldonica',
    description: "Alfama, Mouraria, miradouros et trams en pente. Lisbonne se ralentit facilement — c'est une ville qui se donne à ceux qui traînent.",
    url: 'https://www.heldonica.fr/destinations/lisbonne',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: 'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=1200&q=80', width: 1200, height: 630, alt: 'Lisbonne slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lisbonne slow travel | Guide Heldonica',
    description: "Alfama, miradouros, trams. Lisbonne se donne à ceux qui traînent.",
    images: ['https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=1200&q=80'],
    creator: '@heldonica',
  },
}

export default function LisbonnePage() {
  return <DestinationPage slug="lisbonne" />
}
