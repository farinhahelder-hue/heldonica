import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Côte Est en couple : notre carnet slow travel | Heldonica",
  description: "Machico, Caniçal, la côte sauvage. L'arrivée en avion à Madère. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Côte Est en couple : notre carnet slow travel | Heldonica",
    description: "Machico, Caniçal, la côte sauvage. L'arrivée en avion à Madère. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/madere/cote-est"
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

export default async function CoteEstPage() {
  const zones = await getPageZones('destinations-madere-cote-est')
  return (
    <InlineEditProvider page="destinations-madere-cote-est" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-madere-cote-est"
        name="Côte Est"
        parentName="Madère"
        parentSlug="madere"
        heroImage="/og-default.jpg"
        introText="Machico, Caniçal, la côte sauvage. L'arrivée en avion."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
