import type { Metadata } from 'next';
import DestinationsClient from './DestinationsClient';
import { getPageContent } from '@/lib/cms-pages';

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Destinations Hors des Sentiers Battus — Pépites Dénichées | Heldonica',
  description:
    'Madère, Roumanie, Sicile et bien d\'autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules. Itinéraires et pépites dénichées.',
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

export default async function DestinationsPage() {
  const pageContent = await getPageContent('destinations');
  return <DestinationsClient pageContent={pageContent} />;
}
