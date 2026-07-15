import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Costa Smeralda en couple : notre carnet slow travel | Heldonica',
  description: 'Le nord.millionnaires, plages incredible en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Costa Smeralda en couple : notre carnet slow travel | Heldonica',
    description: 'Le nord.millionnaires, plages incredible en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne/costa-smeralda'
  }
}

const highlights = [
  {
    "emoji": "🏝️",
    "title": "Porto Cervo",
    "description": "Le centre."
  },
  {
    "emoji": "💎",
    "title": "Smeralda",
    "description": "La plage."
  },
  {
    "emoji": "⛵",
    "title": "Cala Raul",
    "description": "Cachée."
  }
]

export default function CostaSmeraldaPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Costa Smeralda"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
        introText="Costa Smeralda, c'est les plages des stars. Mais entre Juin et Septembre seulement."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
