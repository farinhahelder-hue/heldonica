import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Cali en couple : notre carnet slow travel | Heldonica',
  description: 'Capitale de la salsa. Valle del Cauca en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Cali en couple : notre carnet slow travel | Heldonica',
    description: 'Capitale de la salsa. Valle del Cauca en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/colombie/cali'
  }
}

const highlights = [
  {
    "emoji": "💃",
    "title": "Salsa",
    "description": "Calle 38."
  },
  {
    "emoji": "🏃",
    "title": "Feria",
    "description": "Decembre."
  },
  {
    "emoji": "🌯",
    "title": "Canqui",
    "description": "Empanadas."
  }
]

export default function CaliPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Cali"
        parentName="Colombie"
        parentSlug="colombie"
        heroImage="https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80"
        introText="Cali, c'est la capitale mondiale de la salsa. Les clubs, les festivals, la fievre."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
