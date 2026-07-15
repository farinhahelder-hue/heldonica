import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Cartago en couple : notre carnet slow travel | Heldonica',
  description: 'Valle del Cauca. Zone cafe. Tradition en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Cartago en couple : notre carnet slow travel | Heldonica',
    description: 'Valle del Cauca. Zone cafe. Tradition en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/colombie/cartago'
  }
}

const highlights = [
  {
    "emoji": "☕",
    "title": "Cafe",
    "description": "Finca."
  },
  {
    "emoji": "🌱",
    "title": "Ferme",
    "description": "Visites."
  },
  {
    "emoji": "🥭",
    "title": "Fruit",
    "description": "Local."
  }
]

export default function CartagoPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Cartago"
        parentName="Colombie"
        parentSlug="colombie"
        heroImage="https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80"
        introText="Cartago, c'est la zone cafe. Les fincas, les plantations, le meilleur cafe de Colombie."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
