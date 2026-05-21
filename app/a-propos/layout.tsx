import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qui sommes-nous — Hélder & Elena | Heldonica',
  description:
    'Hélder et Elena, couple franco-portugais passionné de slow travel. On a appris à voyager vrai — maintenant on met ça au service du vôtre. Notre histoire, notre méthode.',
  alternates: { canonical: 'https://www.heldonica.fr/a-propos' },
  openGraph: {
    title: 'Qui sommes-nous | Heldonica',
    description: 'Hélder et Elena — slow travellers, travel planners, et le couple derrière Heldonica.',
    url: 'https://www.heldonica.fr/a-propos',
    siteName: 'Heldonica',
    type: 'profile',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qui sommes-nous | Heldonica',
    description: 'Hélder et Elena, le couple derrière Heldonica — slow travel et conception de voyages sur mesure.',
  },
}

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
