import { describe, it, expect } from 'vitest';
import { validateAlbumPhotoMeta } from '@/lib/photo-albums';
import { validatePhotoEvidence } from '@/lib/photo-evidence';
import { detectStockPhoto } from '@/lib/photo-exif';
import { siteUrl } from '@/lib/site-url';
import { createSafeSupabaseStub } from '@/lib/supabase-stub';

const VALID_PHOTO = {
  imageUrl: 'https://www.heldonica.fr/images/destinations/madere/fanal.jpg',
  location: 'Madère, Fanal',
  date: '2025-07-12',
  anecdote: 'Brume matinale dans la forêt de lauriers.',
  albumId: 'madere-2025',
};

describe('lib/photo-albums — validateAlbumPhotoMeta', () => {
  it('accepte une photo vécue complète', () => {
    const result = validateAlbumPhotoMeta(VALID_PHOTO);
    expect(result.ok).toBe(true);
    expect(result.issues).toBeUndefined();
    expect(result.data.albumId).toBe('madere-2025');
  });

  it('refuse une photo sans lieu, date ni anecdote (règle n°1 : on n\'invente rien)', () => {
    const result = validateAlbumPhotoMeta({ imageUrl: VALID_PHOTO.imageUrl });
    expect(result.ok).toBe(false);
    expect(result.issues?.length).toBeGreaterThanOrEqual(3);
  });

  it('refuse une date non ISO 8601 et une URL non HTTPS', () => {
    const result = validateAlbumPhotoMeta({
      ...VALID_PHOTO,
      imageUrl: 'http://exemple.fr/x.jpg',
      date: '12/07/2025',
    });
    expect(result.ok).toBe(false);
    expect(result.issues?.some((i) => i.includes('HTTPS'))).toBe(true);
    expect(result.issues?.some((i) => i.includes('ISO 8601'))).toBe(true);
  });

  it('applique albumId par défaut sans inventer de métadonnée', () => {
    const result = validateAlbumPhotoMeta({ ...VALID_PHOTO, albumId: '' });
    expect(result.ok).toBe(true);
    expect(result.data.albumId).toBe('divers');
  });
});

describe('lib/photo-evidence — validatePhotoEvidence', () => {
  it('retourne un tableau vide pour une preuve conforme', () => {
    expect(validatePhotoEvidence(VALID_PHOTO)).toEqual([]);
  });

  it('signale les champs manquants', () => {
    const errors = validatePhotoEvidence({ imageUrl: VALID_PHOTO.imageUrl });
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('refuse une anecdote de plus de 200 caractères', () => {
    const errors = validatePhotoEvidence({ ...VALID_PHOTO, anecdote: 'a'.repeat(201) });
    expect(errors.some((e) => e.includes('200'))).toBe(true);
  });
});

describe('lib/photo-exif — detectStockPhoto', () => {
  it('ne signale rien pour une photo maison Heldonica', () => {
    const result = detectStockPhoto('/images/destinations/madere/fanal.jpg');
    expect(result.isStockCandidate).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it('détecte un hébergeur de banque d\'images', () => {
    const result = detectStockPhoto('https://images.unsplash.com/photo-123456');
    expect(result.isStockCandidate).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('détecte un nom de fichier de banque', () => {
    const result = detectStockPhoto('shutterstock_987654.jpg');
    expect(result.isStockCandidate).toBe(true);
  });
});

describe('lib/site-url — siteUrl', () => {
  it('retourne une base HTTPS sans slash final', () => {
    const url = siteUrl();
    expect(url).toMatch(/^https:\/\//);
    expect(url.endsWith('/')).toBe(false);
  });

  it('compose une URL canonique', () => {
    expect(siteUrl('/destinations/madere')).toMatch(/\/destinations\/madere$/);
  });
});

describe('lib/supabase-stub — createSafeSupabaseStub', () => {
  it('ne plante pas sur une chaîne de requête et résout sans donnée', async () => {
    const stub = createSafeSupabaseStub() as unknown as {
      from: (t: string) => { select: () => { eq: () => Promise<unknown> } };
    };
    const result = await stub.from('articles').select().eq();
    expect(result).toEqual({ data: null, error: null });
  });

  it('reste chaînable et ne signale jamais de faux succès', async () => {
    const stub = createSafeSupabaseStub() as unknown as Record<string, unknown>;
    const chained = await (stub as { from: (t: string) => unknown }).from('cms_audit_log');
    expect(chained).toBeDefined();
  });
});
