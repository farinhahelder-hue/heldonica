import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Porto Moniz slow travel : piscines naturelles de Madère | Heldonica",
  description: "Notre guide pour visiter Porto Moniz à Madère. Baignade dans les piscines de roche volcanique naturelle, vagues atlantiques et conseils slow travel.",
  openGraph: {
    title: "Porto Moniz slow travel : piscines naturelles de Madère | Heldonica",
    description: "Baignade dans les piscines de roche volcanique naturelle à Porto Moniz, vagues atlantiques et conseils slow travel.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/madere/porto-moniz"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-madere-porto-moniz', metadata)
}


const highlights = [
  {
    emoji: '🌊',
    title: 'Les Piscines Naturelles Volcaniques',
    description: 'Des bassins de roche basaltique noire alimentés directement par les marées de l\'océan Atlantique. Une eau limpide et une baignade hors du commun.',
  },
  {
    emoji: '🏰',
    title: 'Le Fort de São João Baptista',
    description: 'Une petite forteresse historique datant du XVIIe siècle édifiée pour protéger la côte des pirates. Elle abrite aujourd\'hui un petit aquarium.',
  },
  {
    emoji: '🚗',
    title: 'La Route Cotière Nord',
    description: 'La route menant à Porto Moniz longe des falaises abruptes et traverse d\'anciens tunnels creusés dans la roche volcanique. Spectaculaire.',
  }
]

export default async function PortoMonizPage() {
  const zones = await getPageZones('destinations-madere-porto-moniz')
  return (
    <InlineEditProvider page="destinations-madere-porto-moniz" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-madere-porto-moniz"
        name="Porto Moniz"
        parentName="Madère"
        parentSlug="madere"
        heroImage="/og-default.jpg"
        introText="Porto Moniz, situé à la pointe nord-ouest de Madère, est célèbre pour ses extraordinaires piscines naturelles formées par la lave volcanique. C'est l'un des lieux où l'énergie brute de l'océan Atlantique rencontre la roche noire, créant un paysage inoubliable."
        highlights={highlights}
        localTip="Privilégie les piscines naturelles gratuites (plus sauvages) situées près du port plutôt que les piscines payantes si tu cherches une ambiance brute et sans touristes."
      />
      <Footer />
    </InlineEditProvider>
  )
}
