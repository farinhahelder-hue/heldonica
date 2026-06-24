import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Témoignages — Ce qu\'ils en disent',
  description:
    'Avis et retours de voyageurs Heldonica : des voyages sur mesure qui marquent, des itinéraires pensés pour chaque projet.',
  alternates: { canonical: 'https://www.heldonica.fr/temoignages' },
  openGraph: {
    title: 'Témoignages | Heldonica',
    description: 'Ce que nos voyageurs disent de leur expérience Heldonica — slow travel, conception sur mesure.',
    url: 'https://www.heldonica.fr/temoignages',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary',
    title: 'Témoignages | Heldonica',
    description: 'Avis de voyageurs — des expériences sur mesure qui marquent.',
  },
}

export default function TemoignagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
