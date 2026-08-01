import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Lisbonne en couple : notre itinéraire slow travel | Heldonica",
  description: "Prendre le temps à Lisbonne : ruelles de l'Alfama, points de vue secrets (miradouros), fado authentique et pépites dénichées en duo.",
  openGraph: {
    title: "Lisbonne en couple : notre itinéraire slow travel | Heldonica",
    description: "Prendre le temps à Lisbonne : ruelles de l'Alfama, miradouros secrets et fado authentique.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/portugal/lisbonne"
  }
}

const highlights = [
  {
    emoji: '🌅',
    title: 'Les Miradouros Secrets',
    description: 'Les collines de Lisbonne offrent des belvédères spectaculaires. Évite les plus connus et pose-toi au Miradouro de Santa Luzia pour regarder le Tage en silence.',
  },
  {
    emoji: '🏘️',
    title: 'Le Labyrinthe de l\'Alfama',
    description: 'Le plus vieux quartier de la ville, rescapé du séisme de 1755. Perds-toi dans ses escaliers suspendus où le linge sèche aux fenêtres et où résonne le Fado.',
  },
  {
    emoji: '🥧',
    title: 'Pastéis de Belém originaux',
    description: 'Une institution depuis 1837. Si la file d\'attente est longue, prends-les à emporter et déguste-les tièdes dans le parc voisin sous les arbres.',
  }
]

export default async function LisbonnePage() {
  const zones = await getPageZones('destinations-portugal-lisbonne')
  return (
    <InlineEditProvider page="destinations-portugal-lisbonne" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-portugal-lisbonne"
        name="Lisbonne"
        parentName="Portugal"
        parentSlug="portugal"
        heroImage="/og-default.jpg"
        introText="Lisbonne, la ville aux sept collines baignée par la lumière dorée du Tage, est une invitation à ralentir. Entre tramways historiques, façades d'azulejos patinées et mélodies nostalgiques du Fado, elle se découvre à pied, une ruelle pavée après l'autre."
        highlights={highlights}
        localTip="Prends le tramway 28 tôt le matin (avant 8h30) pour éviter la foule des touristes et observer les Lisboètes faire leurs courses."
      />
      <Footer />
    </InlineEditProvider>
  )
}
