import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { executeReleasePublication } from '@/lib/cms-releases';
import { CmsUser } from '@/lib/cms-access';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/cms/releases/[id]/publish : Déclencher la publication groupée d'une release
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'ID de release manquant.' }, { status: 400 });
    }

    const adminUser: CmsUser = {
      id: 'cms-operator',
      email: 'fondateur@heldonica.fr',
      role: 'admin',
    };

    const result = await executeReleasePublication(id, adminUser);

    if (!result.success) {
      return NextResponse.json({
        error: 'Erreurs lors de la publication',
        publishedCount: result.publishedCount,
        details: result.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: `Publication de la release réussie (${result.publishedCount} éléments mis en ligne).`,
      publishedCount: result.publishedCount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
