import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Medellin en couple : notre carnet slow travel | Heldonica",
  description: "Ville de l'éternel printemps. Parche, metro en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Medellin en couple : notre carnet slow travel | Heldonica",
    description: "Ville de l'éternel printemps. Parche, metro en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/colombie/medellin"
  }
}

const highlights = [
  {
    emoji: '🌿',
    title: 'Parche',
    description: 'Jardins botaniques.',
  },
  {
    emoji: '🚡',
    title: 'Metro Cable',
    description: 'Comuna 13.',
  },
  {
    emoji: '💃',
    title: 'Salsa',
    description: 'Parque Leras.',
  }
]

export default async function MedellinPage() {
  const zones = await getPageZones('destinations-colombie-medellin')
  return (
    <InlineEditProvider page="destinations-colombie-medellin" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-colombie-medellin"
        name="Medellin"
        parentName="Colombie"
        parentSlug="colombie"
        heroImage="/og-default.jpg"
        introText="Medellin, c'est la transformation. Le clima eternal, les parches, le metro cable."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
