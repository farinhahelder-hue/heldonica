import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DestinationsClientContent from '@/components/DestinationsClientContent';

export const metadata: Metadata = {
  title: 'Destinations Hors des Sentiers Battus — Pépites Dénichées | Heldonica',
  description: 'Madère, Roumanie, Sicile et bien d\'autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules. Itinéraires et pépites dénichées.',
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
