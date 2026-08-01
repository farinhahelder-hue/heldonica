import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Bogota en couple : notre carnet slow travel | Heldonica",
  description: "Capitale. 2600m, Graffiti, Candelaria en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Bogota en couple : notre carnet slow travel | Heldonica",
    description: "Capitale. 2600m, Graffiti, Candelaria en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/colombie/bogota"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-colombie-bogota', metadata)
}


const highlights = [
  {
    emoji: '🎨',
    title: 'Grafitti',
    description: 'La Candelaria.',
  },
  {
    emoji: '🏛️',
    title: 'Musee',
    description: 'Or.',
  },
  {
    emoji: '🗿',
    title: 'Monserrate',
    description: 'Vue.',
  }
]

export default async function BogotaPage() {
  const zones = await getPageZones('destinations-colombie-bogota')
  return (
    <InlineEditProvider page="destinations-colombie-bogota" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-colombie-bogota"
        name="Bogota"
        parentName="Colombie"
        parentSlug="colombie"
        heroImage="/og-default.jpg"
        introText="Bogota, c'est la capitale a 2600m. Le centre historique, les murs de grafitti, les musees."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
