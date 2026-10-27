/**
 * lib/seo-geo.ts
 *
 * Moteur de référencement géographique (SEO Geo) & données structurées schema.org
 * pour Heldonica (Slow Travel, Carnets de terrain & Hébergements éthiques).
 *
 * Règles :
 * - Zéro coordonnées inventées : seules les coordonnées vérifiées sur le terrain sont injectées.
 * - Respect des standards schema.org (TouristDestination, Place, GeoCoordinates, TouristTrip).
 * - Balises géographiques conformes au W3C (ICBM, geo.position, geo.placename).
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface GeoAddress {
  streetAddress?: string;
  addressLocality?: string;
  postalCode?: string;
  addressRegion?: string;
  addressCountry?: string;
}

export interface TouristDestinationGeoOptions {
  name: string;
  description: string;
  url: string;
  coordinates?: GeoCoordinates;
  address?: GeoAddress;
  country?: string;
  region?: string;
  touristType?: string[];
  mapUrl?: string;
  imageUrl?: string;
  attractions?: Array<{ name: string; description?: string; coordinates?: GeoCoordinates }>;
}

/**
 * Construit un objet JSON-LD conforme Schema.org pour TouristDestination avec géolocalisation
 */
export function buildTouristDestinationJsonLd(opts: TouristDestinationGeoOptions): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: opts.name,
    description: opts.description,
    url: opts.url,
  };

  if (opts.imageUrl) {
    schema.image = opts.imageUrl;
  }

  if (opts.touristType && opts.touristType.length > 0) {
    schema.touristType = opts.touristType;
  } else {
    schema.touristType = ['Slow Travel', 'Écotourisme', 'Randonnée attentive'];
  }

  // GeoCoordinates
  if (opts.coordinates) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: opts.coordinates.latitude,
      longitude: opts.coordinates.longitude,
      ...(opts.coordinates.elevation ? { elevation: opts.coordinates.elevation } : {}),
    };
  }

  // Rattachement géographique (Pays & Région)
  if (opts.country || opts.region) {
    schema.containedInPlace = {
      '@type': opts.region ? 'AdministrativeArea' : 'Country',
      name: opts.region || opts.country,
      ...(opts.country && opts.region
        ? {
            containedInPlace: {
              '@type': 'Country',
              name: opts.country,
            },
          }
        : {}),
    };
  }

  // Adresse postale
  if (opts.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(opts.address.streetAddress ? { streetAddress: opts.address.streetAddress } : {}),
      ...(opts.address.addressLocality ? { addressLocality: opts.address.addressLocality } : {}),
      ...(opts.address.postalCode ? { postalCode: opts.address.postalCode } : {}),
      ...(opts.address.addressRegion ? { addressRegion: opts.address.addressRegion } : {}),
      ...(opts.address.addressCountry ? { addressCountry: opts.address.addressCountry } : {}),
    };
  }

  // Carte interactive associée
  if (opts.mapUrl) {
    schema.hasMap = opts.mapUrl;
  }

  // Attractions / Pépites locales
  if (opts.attractions && opts.attractions.length > 0) {
    schema.includesAttraction = opts.attractions.map((att) => ({
      '@type': 'TouristAttraction',
      name: att.name,
      ...(att.description ? { description: att.description } : {}),
      ...(att.coordinates
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: att.coordinates.latitude,
              longitude: att.coordinates.longitude,
            },
          }
        : {}),
    }));
  }

  return schema;
}

/**
 * Génère les métadonnées géographiques pour le head HTML (ICBM, geo.position, OpenGraph)
 */
export function buildGeoMetaTags(coords: GeoCoordinates, placename?: string, region?: string): Record<string, string> {
  const latStr = coords.latitude.toFixed(6);
  const lngStr = coords.longitude.toFixed(6);

  const tags: Record<string, string> = {
    'geo.position': `${latStr};${lngStr}`,
    ICBM: `${latStr}, ${lngStr}`,
    'place:location:latitude': latStr,
    'place:location:longitude': lngStr,
  };

  if (placename) {
    tags['geo.placename'] = placename;
  }

  if (region) {
    tags['geo.region'] = region;
  }

  return tags;
}

/**
 * Calcul de distance orthodromique (Haversine) entre deux coordonnées GPS en kilomètres
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Estime le temps de marche slow travel (4 km/h à plat + 1h par 300m de dénivelé positif)
 */
export function estimateSlowWalkingTimeMinutes(distanceKm: number, elevationGainMeters = 0): number {
  const flatMinutes = (distanceKm / 4.0) * 60;
  const climbMinutes = (elevationGainMeters / 300.0) * 60;
  return Math.round(flatMinutes + climbMinutes);
}
