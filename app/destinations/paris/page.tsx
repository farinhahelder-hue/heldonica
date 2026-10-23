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

// ⚡ Bolt Performance Optimization:
// What: Incremental Static Regeneration (ISR) with a 1-hour cache.
// Why: Static destination pages that don't need real-time updates should be cached
//      to avoid unnecessary server renders and database lookups.
// Impact: Reduces TTFB significantly and minimizes load on the CMS API.
// Measurement: Check X-Nextjs-Cache header in browser dev tools (should be HIT or STALE).
export const revalidate = 3600

export default function ParisPage() {
  return <DestinationPage slug="paris" />
}
