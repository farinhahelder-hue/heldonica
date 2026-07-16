import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quel type de voyageur es-tu ? | Quiz Heldonica',
  description: "Réponds à 5 questions et découvre le profil de voyageur qui te correspond — et les destinations slow travel qui te ressemblent.",
  alternates: { canonical: 'https://www.heldonica.fr/quiz' },
  openGraph: {
    title: 'Quel type de voyageur es-tu ? | Heldonica',
    description: "5 questions pour trouver ton profil et les destinations slow travel qui te ressemblent.",
    url: 'https://www.heldonica.fr/quiz',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary',
    title: 'Quiz voyageur | Heldonica',
    description: "5 questions pour trouver le profil de voyageur qui te correspond.",
    creator: '@heldonica',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
