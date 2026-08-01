import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Brașov slow travel : notre carnet de voyage | Heldonica",
  description: "Nichée au pied des Carpates en Transylvanie, Brașov est la destination slow travel par excellence. Conseils, randonnées douces et ruelles médiévales.",
  openGraph: {
    title: "Brașov slow travel : notre carnet de voyage | Heldonica",
    description: "Nichée au pied des Carpates en Transylvanie, Brașov est la destination slow travel par excellence.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/roumanie/brasov"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-brasov', metadata)
}


const highlights = [
  {
    emoji: '🏔️',
    title: 'Le Mont Tâmpa',
    description: 'Une montagne verdoyante en plein centre-ville. On peut y monter à pied ou en téléphérique pour profiter d\'une vue imprenable sur les toits rouges de la vieille ville.',
  },
  {
    emoji: '⛪',
    title: 'L\'Église Noire',
    description: 'Un chef-d\'œuvre gothique imposant qui abrite une collection impressionnante de tapis anatoliens offerts par les marchands de passage.',
  },
  {
    emoji: '🧱',
    title: 'La Rue de la Ficelle (Strada Sforii)',
    description: 'L\'une des rues les plus étroites d\'Europe, un passage secret pittoresque chargé d\'histoire au cœur du quartier de Șchei.',
  }
]

export default async function BrasovPage() {
  const zones = await getPageZones('destinations-roumanie-brasov')
  return (
    <InlineEditProvider page="destinations-roumanie-brasov" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-roumanie-brasov"
        name="Brașov"
        parentName="Roumanie"
        parentSlug="roumanie"
        heroImage="/og-default.jpg"
        introText="Brașov allie parfaitement le charme d'une cité médiévale fortifiée et la nature sauvage des Carpates. C'est le point de départ idéal pour explorer la Transylvanie à un rythme lent, en se perdant dans ses ruelles pavées pavoisées de maisons pastel."
        highlights={highlights}
        localTip="Monte au sommet du mont Tâmpa au coucher du soleil pour voir la brume s'installer sur la vallée et les lumières de la ville s'allumer une à une."
      />
      <Footer />
    </InlineEditProvider>
  )
}
