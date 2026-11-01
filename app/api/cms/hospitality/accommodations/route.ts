import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import {
  getAccommodations,
  createAccommodation,
  submitAccommodationForReview,
  publishAccommodation,
  HospitalityStatus,
} from '@/lib/cms-hospitality';
import { CmsUser } from '@/lib/cms-access';

export const dynamic = 'force-dynamic';

// GET /api/cms/hospitality/accommodations
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as HospitalityStatus | null;

  try {
    const list = await getAccommodations(status || undefined);
    return NextResponse.json({ accommodations: list, count: list.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/cms/hospitality/accommodations - Création d'hébergement
export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const user: CmsUser = {
      id: 'cms-operator',
      email: 'fondateur@heldonica.fr',
      role: 'admin',
    };

    const result = await createAccommodation(body, user);
    if (!result.success) {
      return NextResponse.json({ error: result.errors?.join(', ') || 'Validation échouée' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, accommodation: result.accommodation }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur traitement';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/cms/hospitality/accommodations - Transitions de workflow (review / publish)
export async function PATCH(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'id et action requis' }, { status: 400 });
    }

    const user: CmsUser = {
      id: 'cms-operator',
      email: 'fondateur@heldonica.fr',
      role: 'admin',
    };

    if (action === 'submit_review') {
      const res = await submitAccommodationForReview(id, user);
      if (!res.success) return NextResponse.json({ error: res.error }, { status: 400 });
      return NextResponse.json({ ok: true, status: 'waiting_review' });
    }

    if (action === 'publish') {
      const res = await publishAccommodation(id, user);
      if (!res.success) return NextResponse.json({ error: res.error }, { status: 403 });
      return NextResponse.json({ ok: true, status: 'published' });
    }

    return NextResponse.json({ error: `Action inconnue : ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
