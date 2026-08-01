import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: "Côte d Albâtre en couple : notre carnet slow travel | Heldonica",
  description: "Le village classique. Mais tôt le matin, c'est un autre monde en Normandie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Côte d Albâtre en couple : notre carnet slow travel | Heldonica",
    description: "Le village classique. Mais tôt le matin, c'est un autre monde en Normandie. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/normandie/cote-d-albatre"
  }
}

const highlights = [
  {
    emoji: '📍',
    title: 'Découvertes calmes',
    description: 'Prendre le temps d\'arpenter les ruelles et les recoins cachés.',
  },
  {
    emoji: '🌿',
    title: 'Artisanat & Nature',
    description: 'Découvrir la gastronomie locale et les petits producteurs.',
  },
  {
    emoji: '✨',
    title: 'Points de vue',
    description: 'Admirer le panorama au coucher du soleil loin de l\'agitation.',
  }
]

export default async function CtedAlbtrePage() {
  const zones = await getPageZones('destinations-normandie-cote-albatre')
  return (
    <InlineEditProvider page="destinations-normandie-cote-albatre" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-normandie-cote-albatre"
        name="Côte d Albâtre"
        parentName="Normandie"
        parentSlug="normandie"
        heroImage="/og-default.jpg"
        introText="Les falaises de craie blanche. Etretat, Caps, et les petits villages entre les deux."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
