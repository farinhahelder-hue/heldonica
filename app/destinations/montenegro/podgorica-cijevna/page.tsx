import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Podgorica & Cijevna : notre carnet de terrain | Heldonica",
  description: "Podgorica, l'étape que les itinéraires rapides évitent : ruelles ottomanes de Stara Varoš, berges de la Morača et chutes de la Cijevna. Notre carnet testé en couple.",
  openGraph: {
    title: "Podgorica & Cijevna : notre carnet de terrain | Heldonica",
    description: "Ruelles ottomanes de Stara Varoš, berges de la Morača et chutes de la Cijevna, à quinze minutes du centre.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/montenegro/podgorica-cijevna"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-montenegro-podgorica-cijevna', metadata)
}

const highlights = [
  {
    emoji: 'Compass',
    title: 'Stara Varoš',
    description: 'Le quartier ottoman de la capitale : ruelles pavées, la Tour de l\'Horloge Sahat Kula et le pont du Millénium sur la Morača. On y marche sans croiser la foule côtière.',
  },
  {
    emoji: 'Compass',
    title: 'Les chutes de la Cijevna',
    description: 'À quinze minutes du centre, l\'eau bouillonne dans les vasques de calcaire blanc. On s\'y est arrêtés avant de prendre la route de la côte.',
  },
  {
    emoji: 'Compass',
    title: 'La table du Kristal',
    description: 'Mešano meso, salade šopska sous une montagne de fromage râpé et pintes de Nikšićko en terrasse. Notre meilleur dîner du séjour, pour un budget modeste.',
  }
]

export default async function PodgoricaCijevnaPage() {
  const zones = await getPageZones('destinations-montenegro-podgorica-cijevna')
  return (
    <InlineEditProvider page="destinations-montenegro-podgorica-cijevna" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-montenegro-podgorica-cijevna"
        name="Podgorica & Cijevna"
        parentName="Monténégro"
        parentSlug="montenegro"
        heroImage="/images/destinations/montenegro/podgorica_cijevna_chutes.jpg"
        introText="Podgorica est la capitale que les itinéraires éclair traversent sans s'arrêter. On a fait l'inverse : deux jours posés entre les ruelles ottomanes de Stara Varoš, les berges de la Morača et le canyon de la Cijevna, à quinze minutes de là. Le dépaysement tient dans ce contraste entre une ville balkanique sans folklore et un littoral à quarante minutes de route."
        highlights={highlights}
        localTip="Garde la Cijevna pour la fin de matinée : la lumière entre dans le canyon à ce moment-là, et tu seras seul sur place. Le retour vers la côte par la M-2.3 traverse Cetinje, l'ancienne capitale royale."
        travelStyle="slow-culture"
        videoUrl="/videos/destinations/montenegro/montenegro_cijevna_waterfall.mp4"
        videoPoster="/videos/destinations/montenegro/montenegro_cijevna_waterfall_poster.jpg"
        videoTitle="Le bouillonnement des chutes de la Cijevna"
        videoCaption="À quinze minutes de la capitale, la rivière cascade dans les vasques de calcaire blanc."
      />
      <Footer />
    </InlineEditProvider>
  )
}
