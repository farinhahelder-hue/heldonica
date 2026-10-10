import { describe, it, expect } from 'vitest';
import {
  matchAlbumToVaultSpots,
  matchPhotoToVaultSpots,
  generateAllAlbumContextSuggestions,
} from '@/lib/cms-album-context-matcher';
import { VERIFIED_PHOTO_ALBUMS } from '@/lib/cms-photo-albums';

describe('lib/cms-album-context-matcher (Inc-15)', () => {
  it('fait correspondre l\'album Monténégro avec les fiches associées du Coffre', () => {
    const albumMontenegro = VERIFIED_PHOTO_ALBUMS.find((a) => a.id === 'montenegro-podgorica-2026');
    expect(albumMontenegro).toBeDefined();
    if (!albumMontenegro) return;

    const matches = matchAlbumToVaultSpots(albumMontenegro, 5);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].score).toBeGreaterThan(0);
    expect(matches[0].matchingKeywords.length).toBeGreaterThan(0);

    // Vérifie que les fiches suggérées ont du contenu authentique
    for (const m of matches) {
      expect(m.title).toBeTruthy();
      expect(m.excerpt).toBeTruthy();
      expect(m.id).toMatch(/^vault_/);
    }
  });

  it('fait correspondre un cliché individuel avec des pépites pertinentes', () => {
    const photo = {
      id: 'test-photo',
      filename: 'moraca.jpg',
      imageUrl: 'https://heldonica.fr/moraca.jpg',
      location: 'Podgorica, Morača',
      date: '2026-05-27',
      suggestedAnecdote: 'Le pont du Millénium au-dessus de la rivière turquoise.',
    };

    const matches = matchPhotoToVaultSpots(photo, 3);
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeLessThanOrEqual(3);
  });

  it('génère les suggestions pour tous les albums certifiés du CMS', () => {
    const suggestions = generateAllAlbumContextSuggestions();
    expect(suggestions.length).toBe(VERIFIED_PHOTO_ALBUMS.length);

    for (const s of suggestions) {
      expect(s.albumId).toBeTruthy();
      expect(s.albumTitle).toBeTruthy();
      expect(Array.isArray(s.suggestedFiches)).toBe(true);
    }
  });
});
