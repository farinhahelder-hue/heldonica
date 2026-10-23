import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Bogotá en couple : notre carnet slow travel | Heldonica",
  description: "Capitale. 2600m, Graffiti, Candelaria en Colombie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Bogotá en couple : notre carnet slow travel | Heldonica",
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
    emoji: 'Compass',
    title: 'Grafitti',
    description: 'La Candelaria.',
  },
  {
    emoji: 'Compass',
    title: 'Musee',
    description: 'Or.',
  },
  {
    emoji: 'Compass',
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
        name="Bogotá"
        parentName="Colombie"
        parentSlug="colombie"
        heroImage="/og-default.jpg"
        introText="Bogotá, c'est la capitale à 2 600 m. Le centre historique, les murs de graffitis, les musées."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
