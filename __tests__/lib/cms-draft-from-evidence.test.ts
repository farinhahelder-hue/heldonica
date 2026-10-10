import { describe, it, expect } from 'vitest';
import {
  generateEvidenceDraft,
  generateBlocksFromAlbum,
} from '@/lib/cms-draft-from-evidence';
import { VERIFIED_PHOTO_ALBUMS } from '@/lib/cms-photo-albums';

describe('CMS Draft From Evidence (lib/cms-draft-from-evidence.ts)', () => {
  it('génère un brouillon structuré à partir d’un album vérifié spécifique', () => {
    const album = VERIFIED_PHOTO_ALBUMS[0]; // Montenegro
    const draft = generateEvidenceDraft({ albumId: album.id });

    expect(draft.destination).toBe(album.destination);
    expect(draft.totalPhotos).toBe(album.photos.length);
    expect(draft.blocks.length).toBeGreaterThanOrEqual(album.photos.length + 3);

    // Vérifie la présence des types de blocs attendus
    const types = draft.blocks.map((b) => b.type);
    expect(types).toContain('heading');
    expect(types).toContain('text');
    expect(types).toContain('photo_evidence');
    expect(types).toContain('list');
    expect(types).toContain('vault_spot');

    // Vérifie la sérialisation HTML avec le commentaire heldonica:blocks
    expect(draft.htmlContent).toContain('<!-- heldonica:blocks');
    expect(draft.htmlContent).toContain(album.destination);
  });

  it('génère un brouillon valide en recherchant par destination', () => {
    const draft = generateEvidenceDraft({ destination: 'suisse' });

    expect(draft.destination).toBe('suisse');
    expect(draft.blocks.some((b) => b.type === 'photo_evidence')).toBe(true);
    expect(draft.slug).toContain('carnet-suisse-evidence');
  });

  it('génère des blocs avec titres et FAQ cohérents', () => {
    const album = VERIFIED_PHOTO_ALBUMS[1]; // Suisse
    const blocks = generateBlocksFromAlbum(album, 'Titre Personnalisé Test');

    const h1 = blocks.find((b) => b.type === 'heading' && (b as any).level === 1);
    expect((h1 as any).text).toBe('Titre Personnalisé Test');

    const photos = blocks.filter((b) => b.type === 'photo_evidence');
    expect(photos.length).toBe(album.photos.length);

    const verdictSpot = blocks.find((b) => b.type === 'vault_spot');
    expect(verdictSpot).toBeDefined();
    expect((verdictSpot as any).livedExperience).toContain('Moment fort');
  });
});
