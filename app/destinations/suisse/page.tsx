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
    images: [{ url: 'https://www.heldonica.fr/og-default.jpg', width: 1200, height: 630, alt: 'Suisse slow travel — Heldonica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suisse slow travel | Guide Heldonica',
    description: "Montagnes, lacs, trains impeccables. La Suisse devient juste quand on cesse de la résumer à son prix.",
    images: ['https://www.heldonica.fr/og-default.jpg'],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-suisse', metadata)
}


export default function SuissePage() {
  return <DestinationPage slug="suisse" />
}
