import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Sao Vicente en couple : notre carnet slow travel | Heldonica",
  description: "Le nord forgotten. Grottes, plage noire, eoliennes en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
  openGraph: {
    title: "Sao Vicente en couple : notre carnet slow travel | Heldonica",
    description: "Le nord forgotten. Grottes, plage noire, eoliennes en ⭐ Hidden Gem. Notre guide slow travel testé en couple : pépites locales, adresses insolites et conseils pratiques.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/madere/sao-vicente"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-madere-sao-vicente', metadata)
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

export default async function SaoVicentePage() {
  const zones = await getPageZones('destinations-madere-sao-vicente')
  return (
    <InlineEditProvider page="destinations-madere-sao-vicente" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-madere-sao-vicente"
        name="Sao Vicente"
        parentName="Madère"
        parentSlug="madere"
        heroImage="/og-default.jpg"
        introText="Le nord forgotten. Grottes, plage noire, eoliennes."
        highlights={highlights}
        localTip="Prends le temps de visiter les lieux d'intérêt en début de matinée et d'échanger avec les habitants pour dénicher les meilleures adresses de quartier."
      />
      <Footer />
    </InlineEditProvider>
  )
}
