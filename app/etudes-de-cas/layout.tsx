import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Études de cas — Voyages sur mesure | Heldonica',
  description:
    'Comment Heldonica a conçu des voyages sur mesure pour des profils très différents : Madère 10 jours, Colombie family trip, Portugal solo. La méthode en détail.',
  alternates: { canonical: 'https://www.heldonica.fr/etudes-de-cas' },
  openGraph: {
    title: 'Études de cas | Heldonica',
    description: 'Voyages sur mesure conçus par Heldonica — la méthode, les destinations, les résultats.',
    url: 'https://www.heldonica.fr/etudes-de-cas',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Études de cas | Heldonica',
    description: 'Comment on conçoit vos voyages — exemples concrets de Travel Planning sur mesure.',
  },
}

export default function EtudesDeCasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
