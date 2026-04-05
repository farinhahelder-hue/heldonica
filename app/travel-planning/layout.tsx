import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Planning Sur Mesure | Conception de Voyage en Couple | Heldonica',
  description: 'On conçoit votre voyage slow travel sur mesure : itinéraire personnalisé, pépites dénichées, hébergements éco-authentiques. Spécialistes voyages en couple hors des sentiers battus.',
  keywords: ['travel planning sur mesure', 'voyage en couple', 'slow travel', 'itinéraire personnalisé', 'voyage écoresponsable', 'heldonica', 'conception voyage'],
  alternates: {
    canonical: 'https://heldonica.fr/travel-planning',
  },
  openGraph: {
    title: 'Travel Planning Sur Mesure — Conception de Voyage en Couple',
    description: 'Des voyages slow travel conçus sur mesure pour les couples explorateurs. Pépites dénichées, hébergements testés sur le terrain, carnet de route PDF.',
    url: 'https://heldonica.fr/travel-planning',
    siteName: 'Heldonica',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Travel Planning sur mesure Heldonica — voyages en couple slow travel',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Planning Sur Mesure | Heldonica',
    description: 'Voyages slow travel conçus sur mesure pour les couples explorateurs.',
    images: ['https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=85'],
  },
};

export default function TravelPlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
