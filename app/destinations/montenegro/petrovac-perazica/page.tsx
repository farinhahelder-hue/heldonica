import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Petrovac & Perazića Do : notre carnet de terrain | Heldonica",
  description: "Petrovac na Moru, notre camp de base sur l'Adriatique : îlots Katič et Sveta Nedjelja, sentier des falaises de Crvena Stijena et hôtel AS de Perazića Do. Testé en couple.",
  openGraph: {
    title: "Petrovac & Perazića Do : notre carnet de terrain | Heldonica",
    description: "Camp de base prolongé sur l'Adriatique : îlots, sentier des falaises sous les pins et hôtel inachevé face à la mer.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/montenegro/petrovac-perazica"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-montenegro-petrovac-perazica', metadata)
}

const highlights = [
  {
    emoji: 'Compass',
    title: 'Les îlots Katič et Sveta Nedjelja',
    description: 'Deux rochers posés au large, dont l\'un porte une chapelle blanche. On les voit depuis la promenade plantée d\'oliviers et de pins, et la lumière du soir tombe droit dessus.',
  },
  {
    emoji: 'Compass',
    title: 'Le sentier de Crvena Stijena',
    description: 'Un chemin taillé dans le calcaire rouge, sous les pins d\'Alep, qui traverse trois tunnels piétons creusés dans la falaise avant de déboucher sur l\'eau turquoise.',
  },
  {
    emoji: 'Compass',
    title: 'L\'hôtel AS de Perazića Do',
    description: 'Une carcasse brutaliste inachevée au-dessus d\'une crique de galets, couverte de street art. On est montés jusqu\'au dernier étage : la vue plongeante donne le vertige.',
  }
]

export default async function PetrovacPerazicaPage() {
  const zones = await getPageZones('destinations-montenegro-petrovac-perazica')
  return (
    <InlineEditProvider page="destinations-montenegro-petrovac-perazica" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-montenegro-petrovac-perazica"
        name="Petrovac & Perazića Do"
        parentName="Monténégro"
        parentSlug="montenegro"
        heroImage="/images/destinations/montenegro/petrovac_mer.jpg"
        introText="Petrovac na Moru est devenu notre camp de base, et on y est restés bien plus longtemps que prévu. Le village a gardé une taille humaine : tout se fait à pied, de la promenade bordée d'oliviers aux criques rocheuses. Le sentier côtier part vers l'ouest en traversant la falaise rouge, et vers le sud en direction de Buljarica."
        highlights={highlights}
        localTip="Prends de bonnes baskets : le sentier de Crvena Stijena se marche sur de la roche, et l'exploration de l'hôtel AS se fait dans du béton brut. Fin mai, l'eau est déjà tiède et les transats payants ne sont pas encore installés."
        travelStyle="slow-nature"
        videoUrl="/videos/destinations/montenegro/montenegro_hotel_as_perazica.mp4"
        videoPoster="/videos/destinations/montenegro/montenegro_hotel_as_perazica_poster.jpg"
        videoTitle="Sur le toit de l'hôtel fantôme à Perazića Do"
        videoCaption="Dernier étage face à la mer : le béton brut envahi par le street art et l'eau turquoise en contrebas."
      />
      <Footer />
    </InlineEditProvider>
  )
}
