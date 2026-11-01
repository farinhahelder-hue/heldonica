import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { listApiTokens, generateApiToken, revokeApiToken, CmsTokenScope } from '@/lib/cms-tokens';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cms/tokens : Lister les jetons d'accès API
 */
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  const result = await listApiTokens();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ tokens: result.tokens });
}

/**
 * POST /api/cms/tokens : Générer un nouveau jeton d'accès
 */
export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const { name, scopes, expiresInDays } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Le champ name est obligatoire.' }, { status: 400 });
    }

    if (!Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json({ error: 'Au moins un scope est obligatoire.' }, { status: 400 });
    }

    const result = await generateApiToken({
      name,
      scopes: scopes as CmsTokenScope[],
      createdBy: 'cms-admin',
      expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Le rawToken n'est renvoyé qu'ici !
    return NextResponse.json({
      ok: true,
      rawToken: result.rawToken,
      token: result.token,
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/cms/tokens : Révoquer un jeton d'accès
 */
export async function DELETE(req: NextRequest) {
  const authErr = await requireCmsAuth(req);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ error: 'Paramètre id manquant.' }, { status: 400 });
    }

    const result = await revokeApiToken(tokenId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Jeton révoqué avec succès.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
