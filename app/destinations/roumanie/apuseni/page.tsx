import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

// Squelette structurel — contenu à valider avec les photos/anecdotes du voyage
// (grottes, cascades, refuges autour de Gârda de Sus / Țebea / Abrud). Pas encore
// relié à la grille de sous-destinations sur /destinations/roumanie (cms_sub_destinations).

const metadata: Metadata = {
  title: "Monts Apuseni : grottes, cascades et refuges en Transylvanie | Heldonica",
  description: "Guide monts Apuseni en Roumanie : grottes karstiques, cascades, refuges de montagne autour de Gârda de Sus. Notre carnet slow travel testé en couple.",
  openGraph: {
    title: "Monts Apuseni : grottes, cascades et refuges en Transylvanie | Heldonica",
    description: "Guide monts Apuseni en Roumanie : grottes karstiques, cascades, refuges de montagne autour de Gârda de Sus. Notre carnet slow travel testé en couple.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/roumanie/apuseni"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-apuseni', metadata)
}


const highlights = [
  {
    emoji: '🕳️',
    title: 'Grottes karstiques',
    description: 'Le massif est troué de cavités façonnées par l\'érosion calcaire, dont la grotte d\'Ionele et le gouffre glaciaire de Vartop.',
  },
  {
    emoji: '💧',
    title: 'Cascades et ravins',
    description: 'La cascade de Pișoaia et le ravin d\'Ordâncușa serpentent entre les falaises, alimentés par des sources karstiques comme l\'izbuc de Tăuzu.',
  },
  {
    emoji: '🏔️',
    title: 'Refuges de montagne',
    description: 'Les cabanes autour de Gârda de Sus et Dealu Frumos servent d\'étape aux randonneurs qui montent vers le Cucurbăta Mare, point culminant du massif.',
  }
]

export default async function ApuseniPage() {
  const zones = await getPageZones('destinations-roumanie-apuseni')
  return (
    <InlineEditProvider page="destinations-roumanie-apuseni" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-roumanie-apuseni"
        name="Monts Apuseni"
        parentName="Roumanie"
        parentSlug="roumanie"
        heroImage="/og-default.jpg"
        introText="Les monts Apuseni forment le massif le plus occidental des Carpates roumaines, à cheval sur les comtés d'Alba, de Bihor et de Cluj. Le relief karstique a creusé des centaines de grottes et de gouffres, et les vallons cachent cascades et prairies isolées, loin des grands axes touristiques de Transylvanie."
        highlights={highlights}
        localTip="Les routes qui relient les cabanes et les grottes sont souvent non asphaltées et sinueuses en montagne : mieux vaut un véhicule adapté et une marge horaire large, surtout après la pluie."
      />
      <Footer />
    </InlineEditProvider>
  )
}
