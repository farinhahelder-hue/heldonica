'use client'

import Script from 'next/script'

interface GeoDataBlockProps {
  destinationName: string
  country: string
  slug: string
  tagline: string
  heroImage: string
  season: string
  budget: number
  flight: string
  language: string
  currency: string
}

export default function GeoDataBlock({
  destinationName,
  country,
  slug,
  tagline,
  heroImage,
  season,
  budget,
  flight,
  language,
  currency,
}: GeoDataBlockProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://heldonica.fr'

  const geoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${destinationName}, ${country}`,
    alternateName: destinationName,
    description: tagline,
    url: `${SITE_URL}/destinations/${slug}`,
    image: heroImage,
    containedInPlace: {
      '@type': 'Country',
      name: country,
    },
  }

  const travelOfferJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    category: 'TouristDestination',
    name: `Voyage slow travel à ${destinationName}`,
    description: tagline,
    price: budget,
    priceCurrency: 'EUR',
    url: `${SITE_URL}/travel-planning-form?destination=${slug}`,
  }

  return (
    <>
      <Script
        id="geo-place-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(geoJsonLd) }}
      />
      <Script
        id="travel-offer-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(travelOfferJsonLd) }}
      />
    </>
  )
}
