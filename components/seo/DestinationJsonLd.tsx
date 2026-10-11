/**
 * components/seo/DestinationJsonLd.tsx
 *
 * Données structurées schema.org (JSON-LD) pour une page destination.
 * Aide les moteurs à comprendre qu'il s'agit d'une destination touristique
 * rattachée à un pays. Aucune donnée n'est inventée : le composant ne rend
 * que ce que la page lui transmet.
 */

import Script from 'next/script';

export interface DestinationJsonLdProps {
  /** Nom de la destination (ex. « Madère »). */
  name: string;
  /** Description courte / accroche de la destination. */
  description: string;
  /** URL canonique de la page destination. */
  url: string;
  /** Pays ou région de rattachement. */
  country?: string;
}

export default function DestinationJsonLd({
  name,
  description,
  url,
  country,
}: DestinationJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description,
    url,
  };

  if (country) {
    schema.containedInPlace = {
      '@type': 'Country',
      name: country,
    };
  }

  return (
    <Script
      id={`destination-jsonld-${url}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
