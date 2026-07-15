import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Isole Eoliennes en couple : notre carnet slow travel | Heldonica',
  description: 'Volcans, boue en ⭐ Secret Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Isole Eoliennes en couple : notre carnet slow travel | Heldonica',
    description: 'Volcans, boue en ⭐ Secret Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/isole-eoliennes'
  }
}

const highlights = [
  {
    "emoji": "🌋",
    "title": "Vulcano",
    "description": "Boue."
  },
  {
    "emoji": "🍷",
    "title": "Malvasia",
    "description": "Vin."
  },
  {
    "emoji": "📍",
    "title": "Découvertes calmes",
    "description": "Prendre le temps d'arpenter les ruelles et les recoins cachés."
  }
]

export default function IsoleEoliennesPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Isole Eoliennes"
        parentName="⭐ Secret Gem"
        parentSlug="sicile"
        heroImage="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80"
        introText="Les Eoliennes, c'est le volcan sous la mer. Boue chaude, plages noires,Lipari, Salina."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
