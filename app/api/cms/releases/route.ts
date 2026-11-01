import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { listReleases, createRelease, ReleaseItem } from '@/lib/cms-releases';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/releases : Lister les releases
 */
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const result = await listReleases();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ releases: result.releases });
}

/**
 * POST /api/cms/releases : Créer une nouvelle release
 */
export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { title, description, scheduled_at, items } = body;

    const result = await createRelease({
      title,
      description,
      scheduled_at,
      items: items as ReleaseItem[],
      user: {
        id: 'cms-operator',
        email: 'fondateur@heldonica.fr',
        role: 'admin',
      },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, release: result.release }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
