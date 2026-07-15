import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Catane en couple : notre carnet slow travel | Heldonica',
  description: 'Est. Volcan, baroque en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Catane en couple : notre carnet slow travel | Heldonica',
    description: 'Est. Volcan, baroque en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/catane'
  }
}

const highlights = [
  {
    "emoji": "🌋",
    "title": "Etna",
    "description": "Volcan."
  },
  {
    "emoji": "🏛️",
    "title": "Duomo",
    "description": "Cathedrale."
  },
  {
    "emoji": "♠️",
    "title": "Marche",
    "description": "Poisson."
  }
]

export default function CatanePage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Catane"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80"
        introText="Catane, c'est au pied de l'Etna. Volcan, lave noire, cathedral baroque."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
