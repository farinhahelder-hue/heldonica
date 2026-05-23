import type { Metadata } from 'next';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Destinations Hors des Sentiers Battus — Pépites Dénichées | Heldonica',
  description:
    "Madère, Roumanie, Sicile et bien d'autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules. Itinéraires et pépites dénichées.",
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
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: { '@id': 'https://www.heldonica.fr' }
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: { '@id': 'https://www.heldonica.fr/destinations' }
      },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Destinations Hors des Sentiers Battus — Pépites Dénichées | Heldonica',
    description: "Madère, Roumanie, Sicile et bien d'autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules.",
    url: 'https://www.heldonica.fr/destinations',
    hasPart: [
      { '@type': 'WebPage', name: 'Madère', url: 'https://www.heldonica.fr/destinations/madere' },
      { '@type': 'WebPage', name: 'Sicile', url: 'https://www.heldonica.fr/travel-planning-form?destination=sicile' },
      { '@type': 'WebPage', name: 'Roumanie', url: 'https://www.heldonica.fr/destinations/roumanie' },
    ]
  };

  return (
    <>
      <Script
        id="destinations-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Script
        id="destinations-collection-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <div style={{ minHeight: '100vh', padding: '2rem' }}>
        <h1>Destinations</h1>
        <p>Destinations page test</p>
      </div>
    </>
  );
}
