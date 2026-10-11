export const VERIFIED_PHOTO_ALBUMS: any[] = [];
export async function getVerifiedPhotoAlbums() { return []; }
export async function searchVerifiedPhotos() { return []; }
export function validateAlbumPhotoMeta(meta: any) {
  return { ok: true, data: meta, issues: [] };
}
