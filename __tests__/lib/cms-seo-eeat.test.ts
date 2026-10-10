import { describe, it, expect } from 'vitest';
import {
  auditArticleEeat,
  generateAccommodationJsonLd,
  generateArticleJsonLd,
} from '@/lib/cms-seo-eeat';
import { Accommodation } from '@/lib/cms-hospitality';

describe('CMS SEO & E-E-A-T Engine (Google Discover 2026)', () => {
  it('détecte les mots sensationnalistes bannis et dégrade la note', () => {
    const textWithBanned = {
      title: 'Le joyau secret et incontournable de Madère',
      content: 'Ce lieu magnifique offre une pépite à couper le souffle.',
    };

    const result = auditArticleEeat(textWithBanned);
    expect(result.bannedWordsFound.length).toBeGreaterThan(0);
    expect(result.recommendations.some((r) => r.includes('bannis'))).toBe(true);
    expect(result.score).toBeLessThan(80);
  });

  it('attribue une note A+ pour un article slow travel exemplaire', () => {
    const exemplarArticle = {
      title: 'Randonnée crépusculaire sur la crête de Fronalpstock',
      excerpt: 'Deux heures de marche au calme après le départ des derniers funiculaires.',
      content: `
        Nous avons entamé la montée vers 18h par un sentier discret à 1300 m d'altitude.
        Le tarif du refuge est de 45 € par nuit. Il faut compter environ 3 h de marche.
        Pour prolonger l'expérience, consultez nos [guides slow travel](/guides/suisse).
        ` + ' Description du relief et des haltes sauvages.'.repeat(90),
      author: 'Heldonica',
      hasRealPhotos: true,
      hasAnecdote: true,
    };

    const result = auditArticleEeat(exemplarArticle);
    expect(result.bannedWordsFound).toHaveLength(0);
    expect(result.experienceVerified).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.grade).toBe('A+');
  });

  it('génère un JSON-LD Schema.org LodgingBusiness valide', () => {
    const acc: Accommodation = {
      id: 'acc-1',
      name: 'Manoir des Vignes',
      slug: 'manoir-des-vignes',
      type: 'chambre_hotes',
      capacity: 4,
      price_per_night: 130,
      description: 'Maison de maître viticole éco-responsable.',
      amenities: ['Petit-déjeuner bio', 'Bornes recharge'],
      status: 'published',
    };

    const jsonLd = generateAccommodationJsonLd(acc);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('LodgingBusiness');
    expect(jsonLd.name).toBe('Manoir des Vignes');
    expect(jsonLd.priceRange).toBe('130 €');
    expect(Array.isArray(jsonLd.amenityFeature)).toBe(true);
  });

  it('génère un JSON-LD Schema.org BlogPosting valide', () => {
    const jsonLd = generateArticleJsonLd({
      title: 'Voyage slow travel dans les Apuseni',
      slug: 'voyage-apuseni-roumanie',
      excerpt: 'Cinq jours au cœur des monts Apuseni.',
      publishedAt: '2026-09-15T12:00:00Z',
    });

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.headline).toBe('Voyage slow travel dans les Apuseni');
    expect(jsonLd.url).toBe('https://heldonica.fr/articles/voyage-apuseni-roumanie');
    expect((jsonLd.author as any).name).toBe('Heldonica');
  });
});
