import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qui sommes-nous — Le duo Heldonica',
  description:
    'Un duo franco-portugais passionné de slow travel. On a appris à voyager vrai — maintenant on met ça au service du vôtre. Notre histoire, notre méthode.',
  alternates: { canonical: 'https://www.heldonica.fr/a-propos' },
  openGraph: {
    title: 'Qui sommes-nous | Heldonica',
    description: 'Le duo derrière Heldonica — slow travellers, travel planners, et le couple franco-portugais.',
    url: 'https://www.heldonica.fr/a-propos',
    siteName: 'Heldonica',
    type: 'profile',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qui sommes-nous | Heldonica',
    description: 'Le couple derrière Heldonica — slow travel et conception de voyages sur mesure.',
  },
}

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
