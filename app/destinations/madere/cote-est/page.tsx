import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Cote Est en couple : notre carnet slow travel | Heldonica',
  description: 'Machico, Canical, la cote sauvage. L arrivee en avion en Madere. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Cote Est en couple : notre carnet slow travel | Heldonica',
    description: 'Machico, Canical, la cote sauvage. L arrivee en avion en Madere. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/cote-est'
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

export default function CoteEstPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Cote Est"
        parentName="Madere"
        parentSlug="madere"
        heroImage="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80"
        introText="Machico, Canical, la cote sauvage. L arrivee en avion."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
