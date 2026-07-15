import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Cluj-Napoca slow travel : notre carnet d’adresses | Heldonica',
  description: 'Découvre Cluj-Napoca, le cœur culturel et universitaire de la Transylvanie. Cafés de spécialité, ruelles cachées et ambiance bohème pour un séjour slow travel.',
  openGraph: {
    title: 'Cluj-Napoca slow travel : notre carnet d’adresses | Heldonica',
    description: 'Découvre Cluj-Napoca, le cœur de la Transylvanie. Cafés de spécialité, ruelles cachées et ambiance bohème.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1564658895070-cf234f4c34f1?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/cluj'
  }
}

const highlights = [
  {
    title: 'La Scène des Cafés',
    description: 'Cluj possède l\'une des scènes de cafés de spécialité les plus vivantes d\'Europe de l\'Est. Des torréfacteurs passionnés et des recoins bohèmes pour lire tranquille.',
    emoji: '☕'
  },
  {
    title: 'Le Jardin Botanique',
    description: 'Un immense havre de paix vallonné en plein cœur de la ville, parfait pour s\'isoler avec un livre sous les serres tropicales centenaires.',
    emoji: '🌿'
  },
  {
    title: 'Le Quartier Historique',
    description: 'Des ruelles pavées préservées autour de la place de l\'Union (Piața Unirii) et l\'église gothique Saint-Michel qui domine la ville.',
    emoji: '⛪'
  }
]

export default function ClujPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Cluj-Napoca"
        parentName="Roumanie"
        parentSlug="roumanie"
        heroImage="https://images.unsplash.com/photo-1564658895070-cf234f4c34f1?w=1400&q=80"
        introText="Cluj-Napoca, la capitale non officielle de la Transylvanie, est une ville qui se vit à travers ses cafés indépendants, ses universités vibrantes et ses parcs cachés. Moins touristique que Brașov, elle offre un aperçu sincère de la Roumanie moderne et créative."
        highlights={highlights}
        localTip="Rends-toi chez Roots ou Meron pour goûter à l'un des meilleurs expressos du pays, puis termine ton après-midi dans les allées calmes du Jardin Botanique."
      />
      <Footer />
    </>
  )
}