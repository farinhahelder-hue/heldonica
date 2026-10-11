export interface PhotoEvidenceItem { id: string, name: string }
export const getVerifiedPhotoAlbums = () => [];
export const validateAlbumPhotoMeta = (args: any): any => ({ ok: true, data: {} });
export const VERIFIED_PHOTO_ALBUMS: { id: string, photos: PhotoEvidenceItem[] }[] = [];
export const searchVerifiedPhotos = (args: any): PhotoEvidenceItem[] => [];
export const getVerifiedAlbumById = (id: string) => null;
