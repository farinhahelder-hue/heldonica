import { NextResponse } from 'next/server';
import { getCmsAuthStatus } from '@/lib/cms-auth';

// Constant-time comparison — mirrors the pattern in lib/cms-auth.ts.
// safeEqual is not exported from that module, so we maintain a local copy here.
async function safeEqual(a: string, b: string): Promise<boolean> {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  if (aBytes.byteLength !== bBytes.byteLength) {
    return false;
  }

  try {
    const { timingSafeEqual } = await import('crypto');
    return timingSafeEqual(aBytes, bBytes);
  } catch {
    return a === b;
  }
}

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
  const bridgeToken = getBridgeToken();

  if (!bridgeToken) {
    return NextResponse.json(
      { error: 'BRAIN_BRIDGE_TOKEN not configured' },
      { status: 503 }
    );
  }

  // Path 1 — CMS admin via x-cms-auth header or session cookie.
  // getCmsAuthStatus handles both the header and the cookie; we only enter this
  // branch when x-cms-auth is present so we don't needlessly invoke the CMS
  // password check on every Brain poll request.
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
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const candidate = authHeader.slice('Bearer '.length);
    const valid = await safeEqual(candidate, bridgeToken);
    if (valid) return null;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // No recognised credential present.
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
