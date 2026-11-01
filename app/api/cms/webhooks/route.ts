import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { listCmsWebhooks, createCmsWebhook, deleteCmsWebhook, CmsWebhookEvent } from '@/lib/cms-webhooks';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/webhooks : Liste des webhooks
 */
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const result = await listCmsWebhooks();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ webhooks: result.webhooks });
}

/**
 * POST /api/cms/webhooks : Création d'un webhook
 */
export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { name, url, events, secret } = body;

    const result = await createCmsWebhook({
      name,
      url,
      events: events as CmsWebhookEvent[],
      secret,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, webhook: result.webhook }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/cms/webhooks : Suppression d'un webhook
 */
export async function DELETE(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de webhook manquant.' }, { status: 400 });
    }

    const result = await deleteCmsWebhook(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Webhook supprimé avec succès.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
