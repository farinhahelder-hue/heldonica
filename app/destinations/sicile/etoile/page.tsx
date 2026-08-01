import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Isole Eoliennes en couple : notre carnet slow travel | Heldonica",
  description: "Volcans, boue en ⭐ Secret Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Isole Eoliennes en couple : notre carnet slow travel | Heldonica",
    description: "Volcans, boue en ⭐ Secret Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/sicile/isole-eoliennes"
  }
}

const highlights = [
  {
    emoji: '🌋',
    title: 'Vulcano',
    description: 'Boue.',
  },
  {
    emoji: '🍷',
    title: 'Malvasia',
    description: 'Vin.',
  },
  {
    emoji: '📍',
    title: 'Découvertes calmes',
    description: 'Prendre le temps d\'arpenter les ruelles et les recoins cachés.',
  }
]

export default async function IsoleEoliennesPage() {
  const zones = await getPageZones('destinations-sicile-etoile')
  return (
    <InlineEditProvider page="destinations-sicile-etoile" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-sicile-etoile"
        name="Isole Eoliennes"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="/og-default.jpg"
        introText="Les Eoliennes, c'est le volcan sous la mer. Boue chaude, plages noires,Lipari, Salina."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
