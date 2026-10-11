export interface PhotoAlbum {
  id: string;
  name: string;
  description?: string;
  cover_photo_id?: string;
  created_at: string;
}

export async function getAlbums(): Promise<PhotoAlbum[]> {
  return [];
}

export function validateAlbumPhotoMeta(meta: any): { ok: boolean, issues: any[], data: any } {
  return { ok: true, issues: [], data: null };
}
