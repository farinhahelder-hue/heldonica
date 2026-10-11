export interface PhotoEvidenceAlbum {
  id: string;
}

export function validateAlbumPhotoMeta(meta: any) {
  return { ok: true, issues: [], data: meta };
}

export const VERIFIED_PHOTO_ALBUMS: PhotoEvidenceAlbum[] = [];

export function getVerifiedPhotoAlbums() {
  return VERIFIED_PHOTO_ALBUMS;
}

export function getVerifiedAlbumById(id: string) {
  return null;
}

export function searchVerifiedPhotos(query: string) {
  return [];
}
