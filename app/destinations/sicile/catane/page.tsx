import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Catane en couple : notre carnet slow travel | Heldonica",
  description: "Est. Volcan, baroque en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Catane en couple : notre carnet slow travel | Heldonica",
    description: "Est. Volcan, baroque en Sicile. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/sicile/catane"
  }
}

const highlights = [
  {
    emoji: '🌋',
    title: 'Etna',
    description: 'Volcan.',
  },
  {
    emoji: '🏛️',
    title: 'Duomo',
    description: 'Cathedrale.',
  },
  {
    emoji: '♠️',
    title: 'Marche',
    description: 'Poisson.',
  }
]

export default async function CatanePage() {
  const zones = await getPageZones('destinations-sicile-catane')
  return (
    <InlineEditProvider page="destinations-sicile-catane" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-sicile-catane"
        name="Catane"
        parentName="Sicile"
        parentSlug="sicile"
        heroImage="/og-default.jpg"
        introText="Catane, c'est au pied de l'Etna. Volcan, lave noire, cathedral baroque."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
