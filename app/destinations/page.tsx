import type { Metadata } from 'next';
import DestinationsClient from './DestinationsClient';
import Script from 'next/script';
import { getDestinations } from '@/lib/destinations-supabase';

export const revalidate = 3600;

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
  const destinations = await getDestinations();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://www.heldonica.fr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: 'https://www.heldonica.fr/destinations',
      },
    ],
  };

  return (
    <>
      <Script
        id="destinations-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <DestinationsClient destinations={destinations} />
    </>
  );

}
