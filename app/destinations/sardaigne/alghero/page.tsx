import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Alghero en couple : notre carnet slow travel | Heldonica",
  description: "Nord-ouest. Influences catalanes en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Alghero en couple : notre carnet slow travel | Heldonica",
    description: "Nord-ouest. Influences catalanes en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/sardaigne/alghero"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-sardaigne-alghero', metadata)
}


const highlights = [
  {
    emoji: '🏰',
    title: 'Remparts',
    description: 'Centre historique.',
  },
  {
    emoji: '🌊',
    title: 'Neptune',
    description: 'Grottes marines.',
  },
  {
    emoji: '🍷',
    title: 'Vermentino',
    description: 'Vin local.',
  }
]

export default async function AlgheroPage() {
  const zones = await getPageZones('destinations-sardaigne-alghero')
  return (
    <InlineEditProvider page="destinations-sardaigne-alghero" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-sardaigne-alghero"
        name="Alghero"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="/og-default.jpg"
        introText="Alghero, c'est la ville catalane. Les remparts, les grottes de Neptune."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
