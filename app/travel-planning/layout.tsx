import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voyage sur mesure hors sentiers battus',
  description:
    'On ne fait pas des itinéraires. On fait le tien. Slow travel vécu, adresses testées et séquence pensée pour couples, solos, familles ou amis.',
  keywords: [
    'travel planning sur mesure',
    'voyage en couple',
    'slow travel',
    'itinéraire personnalisé',
    'voyage écoresponsable',
    'heldonica',
    'conception voyage',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/travel-planning',
  },
  openGraph: {
    title: 'Voyage sur mesure |',
    description:
      'Adresses testées, rythme juste et vraie séquence de terrain pour couples, solos, familles ou amis.',
    url: 'https://www.heldonica.fr/travel-planning',
    siteName: 'Heldonica',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — voyage sur mesure hors sentiers',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voyage sur mesure hors sentiers | Heldonica',
    description:
      'On part de tes contraintes réelles pour construire un voyage qui tient sur le terrain.',
    images: ['/og-default.jpg'],
  },
};

export default function TravelPlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
