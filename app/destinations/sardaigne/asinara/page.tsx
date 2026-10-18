import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

// Les zones de cette page sont éditées dans le CMS et lues depuis Supabase :
// sans fenêtre de revalidation, le HTML prerendu reste fige et une correction
// en base n'apparait jamais. Aligne sur les pages piliers (madere, roumanie,
// montenegro = 300 s).
export const revalidate = 300


const metadata: Metadata = {
  title: "Asinara en couple : notre carnet slow travel | Heldonica",
  description: "L ile prison. Ane blanchis, exclusivite en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Asinara en couple : notre carnet slow travel | Heldonica",
    description: "L ile prison. Ane blanchis, exclusivite en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/sardaigne/asinara"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-sardaigne-asinara', metadata)
}


const highlights = [
  {
    emoji: '🫎',
    title: 'Anes',
    description: 'Blanchis. Partout.',
  },
  {
    emoji: '🏝️',
    title: 'Prison',
    description: 'Ex-colonie.',
  },
  {
    emoji: '📍',
    title: 'Découvertes calmes',
    description: 'Prendre le temps d\'arpenter les ruelles et les recoins cachés.',
  }
]

export default async function AsinaraPage() {
  const zones = await getPageZones('destinations-sardaigne-asinara')
  return (
    <InlineEditProvider page="destinations-sardaigne-asinara" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-sardaigne-asinara"
        name="Asinara"
        parentName="Sardaigne"
        parentSlug="sardaigne"
        heroImage="/og-default.jpg"
        introText="Asinara, c’est l’île aux ânes blanchis. Ils sont partout. Pas de touristes — seulement 1 ferry par jour."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
