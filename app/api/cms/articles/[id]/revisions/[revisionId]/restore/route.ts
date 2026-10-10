import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { restorePostRevision } from '@/lib/cms-revisions';
import { CmsUser } from '@/lib/cms-access';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; revisionId: string }>;
}

/**
 * POST /api/cms/articles/[id]/revisions/[revisionId]/restore : Restaurer une version antérieure (Rollback)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const { id, revisionId } = await context.params;
    if (!id || !revisionId) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
    }

    const adminUser: CmsUser = {
      id: 'operator',
      email: 'admin@heldonica.fr',
      role: 'admin',
    };

    const result = await restorePostRevision(id, revisionId, adminUser);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Article restauré avec succès vers la révision sélectionnée.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
