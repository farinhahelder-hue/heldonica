import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Bogota en couple : notre carnet slow travel | Heldonica',
  description: 'Capitale. 2600m, Graffiti, Candelaria en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Bogota en couple : notre carnet slow travel | Heldonica',
    description: 'Capitale. 2600m, Graffiti, Candelaria en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/colombie/bogota'
  }
}

const highlights = [
  {
    "emoji": "🎨",
    "title": "Grafitti",
    "description": "La Candelaria."
  },
  {
    "emoji": "🏛️",
    "title": "Musee",
    "description": "Or."
  },
  {
    "emoji": "🗿",
    "title": "Monserrate",
    "description": "Vue."
  }
]

export default function BogotaPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Bogota"
        parentName="Colombie"
        parentSlug="colombie"
        heroImage="https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80"
        introText="Bogota, c'est la capitale a 2600m. Le centre historique, les murs de grafitti, les musees."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
