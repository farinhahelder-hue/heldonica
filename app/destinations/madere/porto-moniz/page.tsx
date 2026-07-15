import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'

export const metadata: Metadata = {
  title: 'Porto Moniz slow travel : piscines naturelles de Madère | Heldonica',
  description: 'Notre guide pour visiter Porto Moniz à Madère. Baignade dans les piscines de roche volcanique naturelle, vagues atlantiques et conseils slow travel.',
  openGraph: {
    title: 'Porto Moniz slow travel : piscines naturelles de Madère | Heldonica',
    description: 'Baignade dans les piscines de roche volcanique naturelle à Porto Moniz, vagues atlantiques et conseils slow travel.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1548567119-9486c91350a4?w=1200&q=80'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/porto-moniz'
  }
}

const highlights = [
  {
    title: 'Les Piscines Naturelles Volcaniques',
    description: 'Des bassins de roche basaltique noire alimentés directement par les marées de l\'océan Atlantique. Une eau limpide et une baignade hors du commun.',
    emoji: '🌊'
  },
  {
    title: 'Le Fort de São João Baptista',
    description: 'Une petite forteresse historique datant du XVIIe siècle édifiée pour protéger la côte des pirates. Elle abrite aujourd\'hui un petit aquarium.',
    emoji: '🏰'
  },
  {
    title: 'La Route Cotière Nord',
    description: 'La route menant à Porto Moniz longe des falaises abruptes et traverse d\'anciens tunnels creusés dans la roche volcanique. Spectaculaire.',
    emoji: '🚗'
  }
]

export default function PortoMonizPage() {
  return (
    <>
      <Header />
      <SubDestinationTemplate
        name="Porto Moniz"
        parentName="Madère"
        parentSlug="madere"
        heroImage="https://images.unsplash.com/photo-1548567119-9486c91350a4?w=1400&q=80"
        introText="Porto Moniz, situé à la pointe nord-ouest de Madère, est célèbre pour ses extraordinaires piscines naturelles formées par la lave volcanique. C'est l'un des lieux où l'énergie brute de l'océan Atlantique rencontre la roche noire, créant un paysage inoubliable."
        highlights={highlights}
        localTip="Privilégie les piscines naturelles gratuites (plus sauvages) situées près du port plutôt que les piscines payantes si tu cherches une ambiance brute et sans touristes."
      />
      <Footer />
    </>
  )
}