import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Buljarica & Lučice : notre carnet de terrain | Heldonica",
  description: "La baie sauvage de Buljarica et la crique de Lučice, au sud de Petrovac : sentier sous les pins, belvédère de Kaluđerac et deux kilomètres de plage de galets. Testé en couple.",
  openGraph: {
    title: "Buljarica & Lučice : notre carnet de terrain | Heldonica",
    description: "Crique intime, belvédère à 180° et deux kilomètres de plage sauvage, à pied depuis Petrovac.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/montenegro/buljarica-lucice"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-montenegro-buljarica-lucice', metadata)
}

const highlights = [
  {
    emoji: 'Compass',
    title: 'La crique de Lučice',
    description: 'Une anse intime qu\'on rejoint en franchissant la colline au sud de Petrovac, sous les pins. L\'eau y est calme et la foule ne s\'y aventure pas.',
  },
  {
    emoji: 'Compass',
    title: 'Le belvédère de Kaluđerac',
    description: 'En poursuivant le sentier, on grimpe jusqu\'à un panorama à 180° : la mer d\'un côté, les montagnes de l\'autre. C\'est l\'arrêt qu\'on n\'avait pas prévu et qu\'on a prolongé.',
  },
  {
    emoji: 'Compass',
    title: 'La plage de Buljarica',
    description: 'Plus de deux kilomètres de galets gris, adossés aux montagnes, où l\'on trouve de la place même en plein après-midi. On y a passé une journée entière à lire au bruit des vagues.',
  }
]

export default async function BuljaricaLucicePage() {
  const zones = await getPageZones('destinations-montenegro-buljarica-lucice')
  return (
    <InlineEditProvider page="destinations-montenegro-buljarica-lucice" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-montenegro-buljarica-lucice"
        name="Buljarica & Lučice"
        parentName="Monténégro"
        parentSlug="montenegro"
        heroImage="/images/destinations/montenegro/buljarica_beach.jpg"
        introText="Au sud de Petrovac, la côte change de visage. Le sentier quitte les terrasses pour grimper sous les pins, franchit la colline et redescend vers deux haltes que l'on fait à pied : la crique de Lučice, puis l'immense baie de Buljarica. C'est le tronçon le plus tranquille de notre séjour, et celui où l'on a le moins croisé de monde."
        highlights={highlights}
        localTip="Pars tôt pour éviter la chaleur sur la montée, et emporte de l'eau : il n'y a rien entre Lučice et Buljarica. Le retour se fait par le même sentier, ou en voiture par la route de la côte si tu as garé ton véhicule à Petrovac."
        travelStyle="slow-nature"
      />
      <Footer />
    </InlineEditProvider>
  )
}
