import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const metadata: Metadata = {
  title: "Maramureș slow travel : églises en bois et vallées secrètes | Heldonica",
  description: "Églises en bois UNESCO, portes sculptées de la vallée de l'Iza et traditions pastorales. Notre carnet de route slow travel testé en Roumanie.",
  openGraph: {
    title: "Maramureș slow travel : églises en bois et vallées secrètes | Heldonica",
    description: "Églises en bois UNESCO, portes sculptées de la vallée de l'Iza et traditions pastorales. Notre carnet de route slow travel testé en Roumanie.",
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/roumanie/maramures"
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-maramures', metadata)
}

const highlights = [
  {
    emoji: '🪵',
    title: 'Les Églises en bois UNESCO (Bârsana & Ieud)',
    description: 'Des flèches de chêne noirci s\'élançant vers les nuages, des fresques peintes sur toile à la lueur des cierges et le silence de la vallée de l\'Iza.',
  },
  {
    emoji: '🚪',
    title: 'Les Portes monumentales & la vie pastorale',
    description: 'Des portails de chêne sculptés de soleils et de motifs séculaires, au milieu de collines où le foin sèche en meules coniques traditionnelles.',
  },
  {
    emoji: '🍲',
    title: 'L\'Hospitalité paysanne & la Mămăligă',
    description: 'Des tables paysannes au coin du poêle à bois, où l\'on partage le fromage frais de brebis brânză à 8 € et la confiture de prune maison.',
  }
]

export default async function MaramuresPage() {
  const zones = await getPageZones('destinations-roumanie-maramures')
  return (
    <InlineEditProvider page="destinations-roumanie-maramures" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="destinations-roumanie-maramures"
        name="Maramureș"
        parentName="Roumanie"
        parentSlug="roumanie"
        heroImage="/og-default.jpg"
        introText="Tout au nord de la Roumanie, le Maramureș est l'un des derniers sanctuaires ruraux d'Europe où le bois reste une matière vivante. On a arpenté ces vallées en toute saison lors de nos voyages en 2025 et 2026, au rythme lent des chevaux de trait et du travail artisanal."
        highlights={highlights}
        localTip="Pars tôt le matin sur les routes secondaires de la vallée de la Mara pour observer la brume se lever sur les meules de foin. Prévois du liquide pour les petites auberges familiales et roule prudemment sur les virages de montagne."
      />
      <Footer />
    </InlineEditProvider>
  )
}
