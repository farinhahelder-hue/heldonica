import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Organisateur de voyage | Heldonica',
  description: "Planifie ton itinéraire, calcule ton budget et prépare ta checklist avant de partir. Outil gratuit Heldonica pour organiser ton voyage slow travel.",
  alternates: { canonical: 'https://www.heldonica.fr/organisateur' },
  openGraph: {
    title: 'Organisateur de voyage | Heldonica',
    description: "Itinéraire, budget, checklist — organise ton prochain voyage slow travel en quelques minutes.",
    url: 'https://www.heldonica.fr/organisateur',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary',
    title: 'Organisateur de voyage | Heldonica',
    description: "Itinéraire, budget, checklist — organise ton prochain voyage slow travel.",
    creator: '@heldonica',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
