import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Cagliari en couple : notre carnet slow travel | Heldonica',
  description: 'Le sud. Lagune, dunes, sel en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Cagliari en couple : notre carnet slow travel | Heldonica',
    description: 'Le sud. Lagune, dunes, sel en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne/cagliari'
  }
}

const highlights = [
  {
    "emoji": "🦩",
    "title": "Lagune",
    "description": "Flamants roses."
  },
  {
    "emoji": "🏖️",
    "title": "Piscinas",
    "description": "Dunes."
  },
  {
    "emoji": "🧂",
    "title": "Salines",
    "description": "Sel rose."
  }
]

export default function CagliariPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Cagliari"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
        introText="Cagliari, c'est le sud. La lagune avec les flamants, les dunes de Piscinas."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
