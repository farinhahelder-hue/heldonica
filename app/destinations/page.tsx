import type { Metadata } from 'next';
import DestinationsClient from './DestinationsClient';
import Script from 'next/script';

// These must be server-rendered, not statically pre-rendered
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const metadata: Metadata = {
  title: ‘Destinations | Heldonica’,
  description:
    "Madère, Roumanie, Sicile et bien d’autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules. Itinéraires et pépites dénichées.",
  keywords: [
    ‘destination hors sentiers battus’,
    ‘destination authentique’,
    ‘que faire Madère’,
    ‘itinéraire Roumanie’,
    ‘voyage insolite Europe’,
    ‘pépites voyage’,
  ],
  alternates: {
    canonical: ‘https://www.heldonica.fr/destinations’,
  },
  openGraph: {
    title: ‘Destinations slow travel | Heldonica’,
    description: "Madère, Roumanie, Sicile et bien d’autres : nos destinations authentiques testées sur le terrain, loin des foules.",
    url: ‘https://www.heldonica.fr/destinations’,
    siteName: ‘Heldonica’,
    type: ‘website’,
    locale: ‘fr_FR’,
    images: [
      {
        url: ‘https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85’,
        width: 1200,
        height: 630,
        alt: ‘Destinations slow travel Heldonica — Madère, Roumanie, Sicile’,
      },
    ],
  },
  twitter: {
    card: ‘summary_large_image’,
    title: ‘Destinations slow travel | Heldonica’,
    description: "Madère, Roumanie, Sicile et bien d’autres : nos destinations authentiques testées sur le terrain.",
    images: [‘https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85’],
    creator: ‘@heldonica’,
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
        item: {
          '@id': 'https://www.heldonica.fr'
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: {
          '@id': 'https://www.heldonica.fr/destinations'
        }
      },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Destinations | Heldonica',
    description: "Madère, Roumanie, Sicile et bien d’autres : on te partage nos destinations authentiques testées sur le terrain, loin des foules. Itinéraires et pépites dénichées.",
    url: 'https://www.heldonica.fr/destinations',
    hasPart: [
      {
        '@type': 'WebPage',
        name: 'Madère',
        url: 'https://www.heldonica.fr/destinations/madere'
      },
      {
        '@type': 'WebPage',
        name: 'Sicile',
        url: 'https://www.heldonica.fr/destinations/sicile'
      },
      {
        '@type': 'WebPage',
        name: 'Suisse',
        url: 'https://www.heldonica.fr/destinations/suisse'
      },
      {
        '@type': 'WebPage',
        name: 'Roumanie',
        url: 'https://www.heldonica.fr/destinations/roumanie'
      },
      {
        '@type': 'WebPage',
        name: 'Zurich',
        url: 'https://www.heldonica.fr/destinations/zurich'
      },
      {
        '@type': 'WebPage',
        name: 'Paris',
        url: 'https://www.heldonica.fr/destinations/paris'
      }
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
      <DestinationsClient />
    </>
  );
}
