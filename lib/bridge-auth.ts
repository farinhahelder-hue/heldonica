import { NextResponse } from 'next/server';
import { getCmsAuthStatus } from '@/lib/cms-auth';
import { safeEqual } from '@/lib/safe-equal';

function getBridgeToken(): string | null {
  return process.env.BRAIN_BRIDGE_TOKEN?.trim() || null;
}

/**
 * Authenticates a Bridge API request.
 *
 * Accepts either:
 *   - A valid `x-cms-auth` header (CMS admin access), delegated to getCmsAuthStatus.
 *   - An `Authorization: Bearer <BRAIN_BRIDGE_TOKEN>` header (Brain polling access),
 *     validated with constant-time comparison.
 *
 * Returns `null` when authentication passes (caller should proceed).
 * Returns a `NextResponse` (401 or 503) when authentication fails.
 *
 * The token value is never logged or included in any response body.
 */
export async function requireBridgeAuth(req: Request): Promise<NextResponse | null> {
  // Path 1 — CMS admin via x-cms-auth header or session cookie.
  // Ce chemin passe EN PREMIER : un administrateur doit pouvoir dispatcher une
  // tâche même si BRAIN_BRIDGE_TOKEN n'est pas configuré sur le CMS. Le jeton du
  // pont n'authentifie que le Brain, pas les humains.
  if (req.headers.get('x-cms-auth')) {
    const cmsStatus = await getCmsAuthStatus(req);
    if (cmsStatus === 'ok') return null;
    if (cmsStatus === 'misconfigured') {
      return NextResponse.json(
        { error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Path 2 — Brain polling via Authorization: Bearer <BRAIN_BRIDGE_TOKEN>.
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const bridgeToken = getBridgeToken();
    // Le 503 ne concerne que le poller : lui seul dépend du jeton partagé.
    if (!bridgeToken) {
      return NextResponse.json(
        { error: 'BRAIN_BRIDGE_TOKEN not configured' },
        { status: 503 }
      );
    }
    if (authHeader.startsWith('Bearer ')) {
      const candidate = authHeader.slice('Bearer '.length);
      if (await safeEqual(candidate, bridgeToken)) return null;
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // No recognised credential present.
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
