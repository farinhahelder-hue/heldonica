import { NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { generateEvidenceDraft } from '@/lib/cms-draft-from-evidence';
import { VERIFIED_PHOTO_ALBUMS } from '@/lib/cms-photo-albums';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/drafts/from-evidence
 * Liste les albums disponibles pour générer un brouillon ancré dans les preuves.
 */
export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const albumsSummary = VERIFIED_PHOTO_ALBUMS.map((a) => ({
    id: a.id,
    title: a.title,
    destination: a.destination,
    period: a.period,
    photosCount: a.photosCount,
    coverImageUrl: a.coverImageUrl,
  }));

  return NextResponse.json({ albums: albumsSummary });
}

/**
 * POST /api/cms/drafts/from-evidence
 * Génère un brouillon d'article complet structuré en blocs Heldonica CMS.
 */
export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // Si pas de corps, on accepte les valeurs par défaut
  }

  const { albumId, destination, title } = body;

  try {
    const draft = generateEvidenceDraft({
      albumId,
      destination,
      title,
    });

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la génération du brouillon' },
      { status: 500 }
    );
  }
}
