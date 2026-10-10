import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedPhotoAlbums, getVerifiedAlbumById, searchVerifiedPhotos } from '@/lib/cms-photo-albums';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
    const query = searchParams.get('q');

    if (albumId) {
      const album = getVerifiedAlbumById(albumId);
      if (!album) {
        return NextResponse.json({ error: 'Album introuvable' }, { status: 404 });
      }
      return NextResponse.json({ album });
    }

    if (query) {
      const photos = searchVerifiedPhotos(query);
      return NextResponse.json({ photos });
    }

    const albums = getVerifiedPhotoAlbums();
    return NextResponse.json({ albums });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des albums photos' },
      { status: 500 }
    );
  }
}
