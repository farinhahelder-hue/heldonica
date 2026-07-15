import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Alghero en couple : notre carnet slow travel | Heldonica',
  description: 'Nord-ouest. Influences catalanes en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Alghero en couple : notre carnet slow travel | Heldonica',
    description: 'Nord-ouest. Influences catalanes en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne/alghero'
  }
}

const highlights = [
  {
    "emoji": "🏰",
    "title": "Remparts",
    "description": "Centre historique."
  },
  {
    "emoji": "🌊",
    "title": "Neptune",
    "description": "Grottes marines."
  },
  {
    "emoji": "🍷",
    "title": "Vermentino",
    "description": "Vin local."
  }
]

export default function AlgheroPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Alghero"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
        introText="Alghero, c'est la ville catalane. Les remparts, les grottes de Neptune."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
