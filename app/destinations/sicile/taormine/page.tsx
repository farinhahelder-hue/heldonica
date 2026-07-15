import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Taormine en couple : notre carnet slow travel | Heldonica',
  description: 'Est. Theatre grec, vue mer en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Taormine en couple : notre carnet slow travel | Heldonica',
    description: 'Est. Theatre grec, vue mer en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/taormine'
  }
}

const highlights = [
  {
    "emoji": "🏛️",
    "title": "Theatre",
    "description": "Grec."
  },
  {
    "emoji": "🌊",
    "title": "Isola Bella",
    "description": "Plage."
  },
  {
    "emoji": "🚌",
    "title": "Corvette",
    "description": "Gare."
  }
]

export default function TaorminePage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Taormine"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80"
        introText="Taormine, c'est le spot tourism. Le theatre grec avec vue sur la mer. Incredible."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
