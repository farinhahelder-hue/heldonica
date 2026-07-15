import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Nuoro en couple : notre carnet slow travel | Heldonica',
  description: 'Centre. Montagnes, pasteurs en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Nuoro en couple : notre carnet slow travel | Heldonica',
    description: 'Centre. Montagnes, pasteurs en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne/nuoro'
  }
}

const highlights = [
  {
    "emoji": "⛰️",
    "title": "Gennargentu",
    "description": "Le parc."
  },
  {
    "emoji": "🐑",
    "title": "Transhumance",
    "description": "Printemps."
  },
  {
    "emoji": "🏘️",
    "title": "Orgosolo",
    "description": "Village."
  }
]

export default function NuoroPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Nuoro"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
        introText="Nuoro, c'est la montagne. Les pasteurs, les transhumances, le silence."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
