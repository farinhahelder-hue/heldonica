import { describe, it, expect } from 'vitest';
import {
  buildTouristDestinationJsonLd,
  buildGeoMetaTags,
  calculateHaversineDistanceKm,
  estimateSlowWalkingTimeMinutes,
} from '@/lib/seo-geo';

describe('SEO Geo & Données Structurées schema.org', () => {
  it('construit un JSON-LD complet pour TouristDestination avec coordonnées', () => {
    const jsonLd = buildTouristDestinationJsonLd({
      name: 'Stoos, Suisse',
      description: 'Village sans voiture perché sur les crêtes de Suisse Centrale.',
      url: 'https://www.heldonica.fr/destinations/suisse/stoos',
      country: 'Suisse',
      region: 'Schwyz',
      coordinates: { latitude: 46.9786, longitude: 8.6592, elevation: 1305 },
      mapUrl: 'https://www.heldonica.fr/destinations/suisse/stoos#carte',
      attractions: [
        { name: 'Crête du Fronalpstock', coordinates: { latitude: 46.9697, longitude: 8.6369 } },
      ],
    });

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('TouristDestination');
    expect(jsonLd.name).toBe('Stoos, Suisse');
    expect((jsonLd.geo as any).latitude).toBe(46.9786);
    expect((jsonLd.geo as any).longitude).toBe(8.6592);
    expect((jsonLd.geo as any).elevation).toBe(1305);
    expect((jsonLd.containedInPlace as any).name).toBe('Schwyz');
    expect(jsonLd.hasMap).toBe('https://www.heldonica.fr/destinations/suisse/stoos#carte');
    expect((jsonLd.includesAttraction as any[])[0].name).toBe('Crête du Fronalpstock');
  });

  it('génère des balises geo conformes au standard W3C et OpenGraph', () => {
    const tags = buildGeoMetaTags(
      { latitude: 32.6511, longitude: -16.9097 },
      'Funchal, Madère',
      'PT-30'
    );

    expect(tags['geo.position']).toBe('32.651100;-16.909700');
    expect(tags['ICBM']).toBe('32.651100, -16.909700');
    expect(tags['geo.placename']).toBe('Funchal, Madère');
    expect(tags['geo.region']).toBe('PT-30');
    expect(tags['place:location:latitude']).toBe('32.651100');
    expect(tags['place:location:longitude']).toBe('-16.909700');
  });

  it('calcule la distance Haversine avec précision', () => {
    // Distance entre Paris (48.8566, 2.3522) et Fontainebleau (48.4047, 2.7016) : ~55 km
    const dist = calculateHaversineDistanceKm(48.8566, 2.3522, 48.4047, 2.7016);
    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(60);
  });

  it('estime le temps de marche slow travel avec dénivelé', () => {
    // 8 km à plat : 120 minutes (2h)
    const flatTime = estimateSlowWalkingTimeMinutes(8, 0);
    expect(flatTime).toBe(120);

    // 8 km + 600m D+ : 120 + 120 = 240 minutes (4h)
    const mountainTime = estimateSlowWalkingTimeMinutes(8, 600);
    expect(mountainTime).toBe(240);
  });
});
