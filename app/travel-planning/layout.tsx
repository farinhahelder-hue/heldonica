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
        url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=85',
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
    images: ['https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=85'],
  },
};

const schemaService = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Travel Planning sur mesure — Heldonica",
  "description": "Conception sur mesure d’itinéraires de voyage en couple, slow travel, hors des sentiers battus. On te livre un carnet de route PDF complet avec hébergements testés, restaurants, transports et contacts locaux.",
  "provider": {
    "@type": "Organization",
    "name": "Heldonica",
    "url": "https://heldonica.fr",
    "sameAs": [
      "https://www.instagram.com/heldonica",
      "https://www.linkedin.com/company/heldonicatravel"
    ]
  },
  "areaServed": {
    "@type": "Country",
    "name": "France"
  },
  "url": "https://www.heldonica.fr/travel-planning",
  "priceRange": "€€",
  "serviceType": "Voyage sur mesure",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Travel Planning",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Pack Essentiel"
        },
        "description": "Voyage de 3 à 5 jours",
        "price": "150",
        "priceCurrency": "EUR"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Pack Confort"
        },
        "description": "Voyage de 7 à 14 jours",
        "price": "250",
        "priceCurrency": "EUR"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Pack Premium"
        },
        "description": "Voyage de 2+ semaines",
        "price": "350",
        "priceCurrency": "EUR"
      }
    ]
  }
};

export default function TravelPlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }} />
    </>
  );
}
