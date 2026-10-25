import type { Metadata } from 'next'
import DestinationPage from '../[slug]/DestinationPage'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
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
    images: [{ url: 'https://www.heldonica.fr/images/destinations/suisse/stoos-01.jpg', width: 1200, height: 630, alt: 'Suisse slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suisse slow travel | Guide Heldonica',
    description: "Montagnes, lacs, trains impeccables. La Suisse devient juste quand on cesse de la résumer à son prix.",
    images: ['https://www.heldonica.fr/images/destinations/suisse/stoos-01.jpg'],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-suisse', metadata)
}

// ⚡ Bolt Performance Optimization:
// What: Incremental Static Regeneration (ISR) with a 1-hour cache.
// Why: Static destination pages that don't need real-time updates should be cached
//      to avoid unnecessary server renders and database lookups.
// Impact: Reduces TTFB significantly and minimizes load on the CMS API.
// Measurement: Check X-Nextjs-Cache header in browser dev tools (should be HIT or STALE).
export const revalidate = 3600

export default function SuissePage() {
  return <DestinationPage slug="suisse" />
}
