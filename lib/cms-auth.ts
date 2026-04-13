import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

const SESSION_DURATION_SECONDS = 60 * 60 * 8;
export const CMS_SESSION_COOKIE = 'heldonica_cms_session';

type CmsAuthStatus = 'ok' | 'unauthorized' | 'misconfigured';

type CmsSessionPayload = {
  exp: number;
  iat: number;
  sid: string;
};

function getConfiguredPassword() {
  const password = process.env.CMS_PASSWORD?.trim();
  return password ? password : null;
}

function getSessionSecret() {
  const secret = process.env.CMS_SESSION_SECRET?.trim();
  return secret ? secret : getConfiguredPassword();
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const padding = (4 - (value.length % 4)) % 4;
  const normalized = `${value}${'='.repeat(padding)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return Buffer.from(normalized, 'base64').toString('utf8');
}

function signSessionPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function createSessionToken(secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: CmsSessionPayload = {
    exp: now + SESSION_DURATION_SECONDS,
    iat: now,
    sid: randomBytes(16).toString('hex'),
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function parseSessionPayload(token: string, secret: string): CmsSessionPayload | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
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
      return null;
    }

    if (payload.iat > payload.exp) {
      return null;
    }

    if (Math.floor(Date.now() / 1000) >= payload.exp) {
      return null;
    }

    return {
      exp: payload.exp,
      iat: payload.iat,
      sid: payload.sid,
    };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');

    if (!rawName || rawValue.length === 0) {
      continue;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join('='));
  }

  return cookies;
}

export function getCmsSessionToken() {
  const secret = getSessionSecret();
  return secret ? createSessionToken(secret) : null;
}

export function isValidCmsPassword(candidate: string | null | undefined) {
  const password = getConfiguredPassword();

  if (!password || !candidate) {
    return false;
  }

  return safeEqual(candidate, password);
}

export function getCmsAuthStatus(req: Request): CmsAuthStatus {
  const password = getConfiguredPassword();

  if (!password) {
    return 'misconfigured';
  }

  const headerPassword = req.headers.get('x-cms-auth');
  if (headerPassword && isValidCmsPassword(headerPassword)) {
    return 'ok';
  }

  const secret = getSessionSecret();
  const cookies = parseCookies(req.headers.get('cookie'));
  const sessionCookie = cookies[CMS_SESSION_COOKIE];

  if (secret && sessionCookie && parseSessionPayload(sessionCookie, secret)) {
    return 'ok';
  }

  return 'unauthorized';
}

export function requireCmsAuth(req: Request) {
  const status = getCmsAuthStatus(req);

  if (status === 'ok') {
    return null;
  }

  if (status === 'misconfigured') {
    return NextResponse.json(
      { error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

export function createCmsSessionResponse() {
  const sessionToken = getCmsSessionToken();

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}

export function clearCmsSessionResponse(
  status = 200,
  body: Record<string, unknown> = { ok: true }
) {
  const response = NextResponse.json(body, { status });
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
