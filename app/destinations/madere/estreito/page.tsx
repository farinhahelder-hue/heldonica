import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Estreito de Câmara de Lobos en couple : notre carnet slow travel | Heldonica',
  description: 'La vallée. Les levadas, les cascades, la forêt à Madère. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Estreito de Câmara de Lobos en couple : notre carnet slow travel | Heldonica',
    description: 'La vallée. Les levadas, les cascades, la forêt à Madère. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/estreito'
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

export default function EstreitodeCamaraPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Estreito de Câmara de Lobos"
        parentName="Madère"
        parentSlug="madere"
        heroImage="/og-default.jpg"
        introText="La vallée. Les levadas, les cascades, la forêt."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
