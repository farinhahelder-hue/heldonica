import { NextRequest, NextResponse } from 'next/server';
import { resolveLegacyRedirect } from './app/middleware';

const PROTECTED_PATHS = [
  '/api/seed-articles',
  '/api/revalidate-articles',
  '/api/update-content',
];
const CMS_SESSION_COOKIE = 'heldonica_cms_session';

type CmsSessionPayload = {
  exp: number;
  iat: number;
  sid: string;
};

function isProtectedPath(pathname: string) {
  if (pathname === '/api/cms/auth') {
    return false;
  }

  if (pathname.startsWith('/api/cms')) {
    return true;
  }

  return PROTECTED_PATHS.includes(pathname);
}

function getSessionSecret() {
  const secret = process.env.CMS_SESSION_SECRET?.trim();
  return secret ? secret : process.env.CMS_PASSWORD?.trim() ?? null;
}

function base64UrlDecode(value: string) {
  const padding = (4 - (value.length % 4)) % 4;
  const normalized = `${value}${'='.repeat(padding)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return atob(normalized);
}

function hexToBytes(value: string) {
  if (value.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(value.length / 2);

  for (let index = 0; index < value.length; index += 2) {
    const byte = Number.parseInt(value.slice(index, index + 2), 16);

    if (Number.isNaN(byte)) {
      return null;
    }

    bytes[index / 2] = byte;
  }

  return bytes;
}

async function verifySessionToken(token: string, secret: string) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return false;
  }

  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValidSignature = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(encodedPayload)
  );

  if (!isValidSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<CmsSessionPayload>;

    if (
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      typeof payload.iat !== 'number' ||
      !Number.isFinite(payload.iat) ||
      typeof payload.sid !== 'string' ||
      payload.sid.length === 0
    ) {
      return false;
    }

    if (payload.iat > payload.exp) {
      return false;
    }

    return Math.floor(Date.now() / 1000) < payload.exp;
  } catch {
    return false;
  }
}

async function isAuthorized(req: NextRequest) {
  const password = process.env.CMS_PASSWORD?.trim();

  if (!password) {
    return { ok: false, misconfigured: true };
  }

  const headerPassword = req.headers.get('x-cms-auth');
  if (headerPassword === password) {
    return { ok: true, misconfigured: false };
  }

  const sessionCookie = req.cookies.get(CMS_SESSION_COOKIE)?.value;
  const secret = getSessionSecret();

  if (!sessionCookie || !secret) {
    return { ok: false, misconfigured: false };
  }

  const ok = await verifySessionToken(sessionCookie, secret);
  return { ok, misconfigured: false };
}

export async function middleware(req: NextRequest) {
  const redirectDestination = resolveLegacyRedirect(req.nextUrl.pathname);

  if (redirectDestination) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = redirectDestination;

    return NextResponse.redirect(redirectUrl, 301);
  }

  if (!isProtectedPath(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const auth = await isAuthorized(req);
  if (auth.ok) {
    return NextResponse.next();
  }

  if (auth.misconfigured) {
    return NextResponse.json(
      { error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
