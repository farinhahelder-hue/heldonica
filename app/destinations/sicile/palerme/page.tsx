import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Palerme en couple : notre carnet slow travel | Heldonica',
  description: 'Ouest. Capitale, chaos en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Palerme en couple : notre carnet slow travel | Heldonica',
    description: 'Ouest. Capitale, chaos en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/palerme'
  }
}

const highlights = [
  {
    "emoji": "🏛️",
    "title": "Palazzo",
    "description": "Normans."
  },
  {
    "emoji": "🍝",
    "title": "Capo",
    "description": "Marche."
  },
  {
    "emoji": "🌺",
    "title": "Jardins",
    "description": "Flora."
  }
]

export default function PalermePage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Palerme"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="/og-default.jpg"
        introText="Palerme, c'est le chaos. Mais le bon. Les palais, les marches, la vraie Sicile."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
