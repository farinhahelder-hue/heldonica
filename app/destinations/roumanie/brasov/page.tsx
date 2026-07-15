import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Brașov slow travel : notre carnet de voyage | Heldonica',
  description: 'Nichée au pied des Carpates en Transylvanie, Brașov est la destination slow travel par excellence. Conseils, randonnées douces et ruelles médiévales.',
  openGraph: {
    title: 'Brașov slow travel : notre carnet de voyage | Heldonica',
    description: 'Nichée au pied des Carpates en Transylvanie, Brașov est la destination slow travel par excellence.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1588693951608-2083538bd1d8?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/brasov'
  }
}

const highlights = [
  {
    title: 'Le Mont Tâmpa',
    description: 'Une montagne verdoyante en plein centre-ville. On peut y monter à pied ou en téléphérique pour profiter d\'une vue imprenable sur les toits rouges de la vieille ville.',
    emoji: '🏔️'
  },
  {
    title: 'L\'Église Noire',
    description: 'Un chef-d\'œuvre gothique imposant qui abrite une collection impressionnante de tapis anatoliens offerts par les marchands de passage.',
    emoji: '⛪'
  },
  {
    title: 'La Rue de la Ficelle (Strada Sforii)',
    description: 'L\'une des rues les plus étroites d\'Europe, un passage secret pittoresque chargé d\'histoire au cœur du quartier de Șchei.',
    emoji: '🧱'
  }
]

export default function BrasovPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Brașov"
        parentName="Roumanie"
        parentSlug="roumanie"
        heroImage="https://images.unsplash.com/photo-1588693951608-2083538bd1d8?w=1400&q=80"
        introText="Brașov allie parfaitement le charme d'une cité médiévale fortifiée et la nature sauvage des Carpates. C'est le point de départ idéal pour explorer la Transylvanie à un rythme lent, en se perdant dans ses ruelles pavées pavoisées de maisons pastel."
        highlights={highlights}
        localTip="Monte au sommet du mont Tâmpa au coucher du soleil pour voir la brume s'installer sur la vallée et les lumières de la ville s'allumer une à une."
      />
      <Footer />
    </>
  )
}