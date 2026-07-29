import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Fontainebleau en couple : notre carnet slow travel | Heldonica',
  description: 'Forêt. Escarpements, escalade en Île-de-France. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Fontainebleau en couple : notre carnet slow travel | Heldonica',
    description: 'Forêt. Escarpements, escalade en Île-de-France. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/idf/fontainebleau'
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

export default function FontainebleauPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Fontainebleau"
        parentName="IdF"
        parentSlug="idf"
        heroImage="/og-default.jpg"
        introText="La forêt. Les rochers, les parcours."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
