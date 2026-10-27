/**
 * components/seo/DestinationJsonLd.tsx
 *
 * Données structurées schema.org (JSON-LD) enrichies pour une page destination.
 * Supporte TouristDestination, TouristTrip, Place, GeoCoordinates et Author Organization E-E-A-T.
 * Sécurisation stricte XSS via échappement unicode \\u003c.
 */

import React from 'react';

export interface DestinationJsonLdProps {
  /** Nom de la destination (ex. « Madère »). */
  name: string;
  /** Description courte / accroche de la destination. */
  description: string;
  /** URL canonique de la page destination. */
  url: string;
  /** Pays ou région de rattachement. */
  country?: string;
  /** Région administrative */
  region?: string;
  /** Coordonnées GPS réelles */
  latitude?: number;
  longitude?: number;
  elevation?: number;
  /** Image principale */
  imageUrl?: string;
  /** Types de tourisme ciblés */
  touristType?: string[];
  /** Lien vers la carte interactive */
  mapUrl?: string;
  /** Étapes d'itinéraire pour le balisage TouristTrip */
  itinerary?: { day: number; title: string; activities?: string[]; tip?: string }[];
  /** Offre commerciale / prix d'appel du carnet */
  offers?: {
    price: number | string;
    priceCurrency?: string;
    name?: string;
    description?: string;
  };
}

export default function DestinationJsonLd({
  name,
  description,
  url,
  country,
  region,
  latitude,
  longitude,
  elevation,
  imageUrl,
  touristType,
  mapUrl,
  itinerary,
  offers,
}: DestinationJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['TouristDestination', 'TouristTrip', 'Place'],
    name,
    description,
    url,
    author: {
      '@type': 'Organization',
      name: 'Heldonica',
      url: 'https://www.heldonica.fr',
    },
  };

  if (imageUrl) {
    schema.image = imageUrl;
  }

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
      ...(elevation ? { elevation } : {}),
    };
  }

  if (country || region) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(country ? { addressCountry: country } : {}),
      ...(region ? { addressRegion: region } : {}),
    };
    schema.containedInPlace = {
      '@type': region ? 'AdministrativeArea' : 'Country',
      name: region || country,
    };
  }

  if (mapUrl) {
    schema.hasMap = mapUrl;
  }

  if (touristType && touristType.length > 0) {
    schema.touristType = touristType;
  }

  if (itinerary && itinerary.length > 0) {
    schema.itinerary = {
      '@type': 'ItemList',
      numberOfItems: itinerary.length,
      itemListElement: itinerary.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'TouristTrip',
          name: `Jour ${item.day}: ${item.title}`,
          description: item.activities?.join(' · ') || item.title,
        },
      })),
    };
  }

  if (offers) {
    schema.offers = {
      '@type': 'Offer',
      price: String(offers.price),
      priceCurrency: offers.priceCurrency || 'EUR',
      name: offers.name || `Carnet de voyage slow travel ${name}`,
      availability: 'https://schema.org/InStock',
      url: `${url}#travel-planning`,
    };
  }

  // Échappe < pour la sécurité anti-XSS
  const safeJson = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <script
      id={`destination-jsonld-${url}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
