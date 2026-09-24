import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Nuoro en couple : notre carnet slow travel | Heldonica",
  description: "Centre. Montagnes, pasteurs en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Nuoro en couple : notre carnet slow travel | Heldonica",
    description: "Centre. Montagnes, pasteurs en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/sardaigne/nuoro"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-sardaigne-nuoro', metadata)
}


const highlights = [
  {
    emoji: '⛰️',
    title: 'Gennargentu',
    description: 'Le parc.',
  },
  {
    emoji: '🐑',
    title: 'Transhumance',
    description: 'Printemps.',
  },
  {
    emoji: '🏘️',
    title: 'Orgosolo',
    description: 'Village.',
  }
]

export default async function NuoroPage() {
  const zones = await getPageZones('destinations-sardaigne-nuoro')
  return (
    <InlineEditProvider page="destinations-sardaigne-nuoro" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-sardaigne-nuoro"
        name="Nuoro"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="/og-default.jpg"
        introText="Nuoro, c'est la montagne. Les pasteurs, les transhumances, le silence."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
