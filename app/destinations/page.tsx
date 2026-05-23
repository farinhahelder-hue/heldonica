import type { Metadata } from 'next';
import DestinationsClient from './DestinationsClient';

// ⚡ Bolt Optimization: Use Incremental Static Regeneration (ISR) to cache the page for 1 hour. This significantly improves Time To First Byte (TTFB) compared to force-dynamic.
export const revalidate = 3600


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

export default function DestinationsPage() {
  return <DestinationsClient />;
}
