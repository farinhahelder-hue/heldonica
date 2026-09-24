import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Costa Smeralda en couple : notre carnet slow travel | Heldonica",
  description: "Le nord.millionnaires, plages incredible en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Costa Smeralda en couple : notre carnet slow travel | Heldonica",
    description: "Le nord.millionnaires, plages incredible en Sardaigne. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/sardaigne/costa-smeralda"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-sardaigne-costa-smeralda', metadata)
}


const highlights = [
  {
    emoji: '🏝️',
    title: 'Porto Cervo',
    description: 'Le centre.',
  },
  {
    emoji: '💎',
    title: 'Smeralda',
    description: 'La plage.',
  },
  {
    emoji: '⛵',
    title: 'Cala Raul',
    description: 'Cachée.',
  }
]

export default async function CostaSmeraldaPage() {
  const zones = await getPageZones('destinations-sardaigne-costa-smeralda')
  return (
    <InlineEditProvider page="destinations-sardaigne-costa-smeralda" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-sardaigne-costa-smeralda"
        name="Costa Smeralda"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="/og-default.jpg"
        introText="Costa Smeralda, c'est les plages des stars. Mais entre Juin et Septembre seulement."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
