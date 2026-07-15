import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Syracuse en couple : notre carnet slow travel | Heldonica',
  description: 'Sud-est. Antique, Ortigia en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Syracuse en couple : notre carnet slow travel | Heldonica',
    description: 'Sud-est. Antique, Ortigia en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/syracuse'
  }
}

const highlights = [
  {
    "emoji": "🏛️",
    "title": "Temple",
    "description": "Apollo."
  },
  {
    "emoji": "⌛",
    "title": "Ortigia",
    "description": "Ile."
  },
  {
    "emoji": "🍊",
    "title": "Marche",
    "description": "Ortigia."
  }
]

export default function SyracusePage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Syracuse"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80"
        introText="Syracuse, c'est la ville antique. Le temple, la cathedral, Ortigia."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
