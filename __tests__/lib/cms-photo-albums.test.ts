import { describe, it, expect } from 'vitest';
import {
  VERIFIED_PHOTO_ALBUMS,
  getVerifiedPhotoAlbums,
  getVerifiedAlbumById,
  searchVerifiedPhotos,
} from '@/lib/cms-photo-albums';
import { validatePhotoEvidence } from '@/lib/photo-evidence';

describe('CMS Photo Albums Registry & Evidence', () => {
  it('exposes authentic verified albums for all key destinations', () => {
    const albums = getVerifiedPhotoAlbums();
    expect(albums.length).toBeGreaterThanOrEqual(3);

    const destinations = albums.map((a) => a.destination);
    expect(destinations).toContain('montenegro');
    expect(destinations).toContain('suisse');
    expect(destinations).toContain('roumanie');
    // Madère est volontairement absent : ses 5 visuels portaient tous un manifeste
    // C2PA de générateur (mesuré le 30/10/2026). Aucune photo de terrain madérienne
    // n'existe dans le dépôt — publier l'album reviendrait à illustrer un vécu avec
    // des images inventées (AGENTS.md, règle n°1).
    expect(destinations).not.toContain('madere');
  });

  it('guarantees that all photos pass validatePhotoEvidence without errors', () => {
    for (const album of VERIFIED_PHOTO_ALBUMS) {
      for (const photo of album.photos) {
        const errors = validatePhotoEvidence({
          imageUrl: photo.imageUrl,
          location: photo.location,
          date: photo.date,
          anecdote: photo.suggestedAnecdote,
          albumLink: photo.albumLink,
        });

        expect(errors, `Erreur de validation pour ${photo.filename} dans ${album.id}`).toEqual([]);
        expect(photo.suggestedAnecdote.length).toBeLessThanOrEqual(200);
      }
    }
  });

  it('retrieves an album by its ID correctly', () => {
    const album = getVerifiedAlbumById('montenegro-podgorica-2026');
    expect(album).toBeDefined();
    expect(album?.destination).toBe('montenegro');
    expect(album?.photos.length).toBe(5);

    const nonexistent = getVerifiedAlbumById('unknown-album');
    expect(nonexistent).toBeUndefined();
  });

  it('searches verified photos by keyword', () => {
    const cijevnaResults = searchVerifiedPhotos('Cijevna');
    expect(cijevnaResults.length).toBeGreaterThanOrEqual(1);
    expect(cijevnaResults[0].location).toContain('Cijevna');

    const moracaResults = searchVerifiedPhotos('Morača');
    expect(moracaResults.length).toBeGreaterThanOrEqual(1);

    // « Fanal » n'appartient qu'au carnet Madère, dont l'album a été retiré : ses
    // 5 visuels portaient un manifeste C2PA de générateur. Aucune photo de terrain
    // ne remplace — donc zéro résultat, et c'est le comportement voulu.
    expect(searchVerifiedPhotos('Fanal')).toEqual([]);

    const all = searchVerifiedPhotos('');
    expect(all.length).toBeGreaterThan(10);
  });
});
