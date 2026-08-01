import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Camara de Lobos en couple : notre carnet slow travel | Heldonica",
  description: "Le village de pecheurs. Le plus authentique en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Camara de Lobos en couple : notre carnet slow travel | Heldonica",
    description: "Le village de pecheurs. Le plus authentique en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/madere/camara-de-lobos"
  }
}

const highlights = [
  {
    emoji: '📍',
    title: 'Découvertes calmes',
    description: 'Prendre le temps d\'arpenter les ruelles et les recoins cachés.',
  },
  {
    emoji: '🌿',
    title: 'Artisanat & Nature',
    description: 'Découvrir la gastronomie locale et les petits producteurs.',
  },
  {
    emoji: '✨',
    title: 'Points de vue',
    description: 'Admirer le panorama au coucher du soleil loin de l\'agitation.',
  }
]

export default async function CamaradeLobosPage() {
  const zones = await getPageZones('destinations-madere-camara-de-lobos')
  return (
    <InlineEditProvider page="destinations-madere-camara-de-lobos" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-madere-camara-de-lobos"
        name="Camara de Lobos"
        parentName="Madère"
        parentSlug="madere"
        heroImage="/og-default.jpg"
        introText="Le village de pecheurs. Le plus authentique."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
