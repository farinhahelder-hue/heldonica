import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DestinationsClientContent from '@/components/DestinationsClientContent';

export const metadata: Metadata = {
  title: 'Destinations Hors des Sentiers Battus — Pépites Dénichées | Heldonica',
  description:
    'Madère, Roumanie, Sicile et bien d\'autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules. Itéraires et pépites dénichées.',
  keywords: [
    'destination hors sentiers battus',
    'destination authentique',
    'que faire Madère',
    'itinéraire Roumanie',
    'voyage insolite Europe',
    'pépites voyage',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations',
  },
  openGraph: {
    title: 'Destinations Hors des Sentiers Battus — Heldonica',
    description:
      'Madère, Roumanie, Sicile : six destinations testées sur le terrain, loin des foules. Itinéraires, budgets et verdicts signés Heldonica.',
    url: 'https://www.heldonica.fr/destinations',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
        width: 1024,
        height: 683,
        alt: 'Destinations slow travel Heldonica — Madère, forêt laurisylve',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destinations Hors des Sentiers Battus — Heldonica',
    description:
      'Madère, Roumanie, Sicile : six destinations testées sur le terrain, loin des foules.',
    images: ['https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg'],
    creator: '@heldonica',
  },
};

export default function DestinationsPage() {
  return (
    <>
      <Header />
      <DestinationsClientContent />
      <Footer />
    </>
  );
}
