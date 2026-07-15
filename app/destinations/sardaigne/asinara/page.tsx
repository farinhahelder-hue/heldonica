import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Asinara en couple : notre carnet slow travel | Heldonica',
  description: 'L ile prison. Ane blanchis, exclusivite en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Asinara en couple : notre carnet slow travel | Heldonica',
    description: 'L ile prison. Ane blanchis, exclusivite en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne/asinara'
  }
}

const highlights = [
  {
    "emoji": "🫎",
    "title": "Anes",
    "description": "Blanchis. Partout."
  },
  {
    "emoji": "🏝️",
    "title": "Prison",
    "description": "Ex-colonie."
  },
  {
    "emoji": "📍",
    "title": "Découvertes calmes",
    "description": "Prendre le temps d'arpenter les ruelles et les recoins cachés."
  }
]

export default function AsinaraPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Asinara"
        parentName="⭐ Hidden Gem"
        parentSlug="sardaigne"
        heroImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
        introText="Asinara, c’est l’île aux ânes blanchis. Ils sont partout. Pas de tourists — seulement 1 ferry par jour."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
