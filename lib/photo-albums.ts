export const VERIFIED_PHOTO_ALBUMS = [];
export const searchVerifiedPhotos = () => [];
export const validateAlbumPhotoMeta = (meta: any) => ({
  ok: true,
  data: {
    imageUrl: '',
    location: '',
    gps: { latitude: 0, longitude: 0 },
    date: '',
    anecdote: '',
    albumId: ''
  },
  issues: []
});
