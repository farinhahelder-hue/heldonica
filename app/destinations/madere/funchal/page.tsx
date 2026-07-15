import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Funchal et environs en couple : notre carnet slow travel | Heldonica',
  description: 'Guide Funchal: vieille ville, Mercado,缆车, restaurants, cosas a fazer en Madere. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Funchal et environs en couple : notre carnet slow travel | Heldonica',
    description: 'Guide Funchal: vieille ville, Mercado,缆车, restaurants, cosas a fazer en Madere. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/funchal-et-environs'
  }
}

const highlights = [
  {
    "emoji": "📍",
    "title": "Découvertes calmes",
    "description": "Prendre le temps d'arpenter les ruelles et les recoins cachés."
  },
  {
    "emoji": "🌿",
    "title": "Artisanat & Nature",
    "description": "Découvrir la gastronomie locale et les petits producteurs."
  },
  {
    "emoji": "✨",
    "title": "Points de vue",
    "description": "Admirer le panorama au coucher du soleil loin de l'agitation."
  }
]

export default function FunchaletenvironsPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Funchal et environs"
        parentName="Madere"
        parentSlug="madere"
        heroImage="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80"
        introText="La capitale de Madere. Le marche, le vieux quartier, et la vue depuis le cable car."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
