import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
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
    images: [{ url: 'https://www.heldonica.fr/og-default.jpg', width: 1200, height: 630, alt: 'Paris slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paris slow travel | Guide Heldonica',
    description: "Paris et l'Île-de-France se lisent mieux quand on sort des grandes phrases.",
    images: ['https://www.heldonica.fr/og-default.jpg'],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-paris', metadata)
}


export default function ParisPage() {
  return <DestinationPage slug="paris" />
}
