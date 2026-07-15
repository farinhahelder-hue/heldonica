import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Achadas da Cruz en couple : notre carnet slow travel | Heldonica',
  description: 'Le funiculaire. 1000m de chute. Vertige en ⭐ Secret Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
  openGraph: {
    title: 'Achadas da Cruz en couple : notre carnet slow travel | Heldonica',
    description: 'Le funiculaire. 1000m de chute. Vertige en ⭐ Secret Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/achadas-da-cruz'
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

export default function AchadasdaCruzPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Achadas da Cruz"
        parentName="⭐ Secret Gem"
        parentSlug="madere"
        heroImage="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
        introText="Le funiculaire. 1000m de chute. Vertige."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </>
  )
}
