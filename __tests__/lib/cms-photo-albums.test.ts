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
    expect(albums.length).toBeGreaterThanOrEqual(4);

    const destinations = albums.map((a) => a.destination);
    expect(destinations).toContain('montenegro');
    expect(destinations).toContain('suisse');
    expect(destinations).toContain('madere');
    expect(destinations).toContain('roumanie');
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
    const fanoalResults = searchVerifiedPhotos('Fanal');
    expect(fanoalResults.length).toBeGreaterThanOrEqual(1);
    expect(fanoalResults[0].location).toContain('Fanal');

    const moracaResults = searchVerifiedPhotos('Morača');
    expect(moracaResults.length).toBeGreaterThanOrEqual(1);

    const all = searchVerifiedPhotos('');
    expect(all.length).toBeGreaterThan(10);
  });
});
