import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import {
  ALBUM_ANECDOTE_MAX,
  validateAlbumMeta,
  validateAlbumPhotoMeta,
} from '@/lib/photo-albums';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/albums/metadata — contrat du service de validation
 * des metadonnees d'albums photos (authentifie, lecture seule, sans acces DB).
 */
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  return NextResponse.json({
    service: 'albums-metadata',
    version: 1,
    description:
      "Valide les metadonnees reelles d'albums photos (EXIF, GPS, date ISO 8601, anecdote vecue). Aucune ecriture, aucune donnee inventee : tout rejet est motive.",
    kinds: ['photo', 'album'],
    constraints: {
      imageUrl: 'URL HTTPS obligatoire',
      location: 'lieu exact vecu, texte brut obligatoire',
      date: 'ISO 8601 YYYY-MM-DD, ou DateTimeOriginal EXIF ("YYYY:MM:DD HH:MM:SS")',
      anecdote: `1..${ALBUM_ANECDOTE_MAX} caracteres, vecue et verifiable`,
      albumLink: 'URL HTTPS optionnelle (album source)',
      gps: 'optionnel, latitude -90..90, longitude -180..180 (direct ou EXIF)',
      tags: 'optionnels, normalises (minuscules, sans doublons, EXIF inclus)',
      album: 'id, title, coverImageUrl (HTTPS) et photos[] (au moins une) obligatoires',
    },
    example: {
      kind: 'photo',
      payload: {
        imageUrl: 'https://example.com/madere.jpg',
        location: 'Madere, Ponta do Sol',
        date: '2024-09-15',
        anecdote: 'Aube vecue sur la falaise.',
        gps: { latitude: 32.68, longitude: -17.1 },
        tags: ['madere', 'falaise'],
      },
    },
  });
}

type MetadataKind = 'photo' | 'album';

function isMetadataKind(value: unknown): value is MetadataKind {
  return value === 'photo' || value === 'album';
}

/**
 * POST /api/cms/albums/metadata — valide un payload { kind, payload }.
 * 200 { ok: true, kind, normalized } ou 422 { ok: false, kind, issues }.
 * Erreurs d'entree : 400 (JSON illisible ou requete mal formee).
 * Jamais d'ecriture, jamais de valeur completee : ce qui est invalide est rejete.
 */
export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, issues: [{ field: '', code: 'invalid_type', message: 'Corps JSON illisible.' }] },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, issues: [{ field: '', code: 'invalid_type', message: 'Le corps doit etre un objet { kind, payload }.' }] },
      { status: 400 },
    );
  }

  const { kind, payload } = body as { kind?: unknown; payload?: unknown };
  if (!isMetadataKind(kind)) {
    return NextResponse.json(
      { ok: false, issues: [{ field: 'kind', code: 'invalid_type', message: 'kind doit etre "photo" ou "album".' }] },
      { status: 400 },
    );
  }

  const result = kind === 'photo' ? validateAlbumPhotoMeta(payload as any) : validateAlbumMeta(payload as any);
  if (!result.ok) {
    return NextResponse.json({ ok: false, kind, issues: result.issues }, { status: 422 });
  }
  return NextResponse.json({ ok: true, kind, normalized: result.data });
}
