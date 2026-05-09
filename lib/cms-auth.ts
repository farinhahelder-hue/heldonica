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
  const pw = process.env.CMS_PASSWORD?.trim();
  return secret ? secret : (pw ? pw : null);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

function base64UrlEncode(value: string) {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const padding = (4 - (value.length % 4)) % 4;
  const normalized = `${value}${'='.repeat(padding)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  return decodeURIComponent(escape(atob(normalized)));
}

function hexEncode(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexDecode(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (isNaN(byte)) return null;
    bytes[i / 2] = byte;
  }
  return bytes;
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return hexEncode(signature);
}

async function verifyPayload(payload: string, signature: string, secret: string): Promise<boolean> {
  const sigBytes = hexDecode(signature);
  if (!sigBytes) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
}

function generateRandomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return hexEncode(arr.buffer);
}

async function createSessionToken(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: CmsSessionPayload = {
    exp: now + SESSION_DURATION_SECONDS,
    iat: now,
    sid: generateRandomHex(16),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

async function parseSessionPayload(
  token: string,
  secret: string
): Promise<CmsSessionPayload | null> {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const valid = await verifyPayload(encodedPayload, signature, secret);
  if (!valid) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<CmsSessionPayload>;
    if (
      typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) ||
      typeof payload.iat !== 'number' || !Number.isFinite(payload.iat) ||
      typeof payload.sid !== 'string' || payload.sid.length === 0
    ) return null;
    if (payload.iat > payload.exp) return null;
    if (Math.floor(Date.now() / 1000) >= payload.exp) return null;
    return { exp: payload.exp, iat: payload.iat, sid: payload.sid };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName || rawValue.length === 0) continue;
    cookies[rawName] = decodeURIComponent(rawValue.join('='));
  }
  return cookies;
}

export async function getCmsSessionToken(): Promise<string | null> {
  const secret = getSessionSecret();
  return secret ? createSessionToken(secret) : null;
}

export function isValidCmsPassword(candidate: string | null | undefined) {
  const password = getConfiguredPassword();
  if (!password || !candidate) return false;
  return safeEqual(candidate, password);
}

export async function getCmsAuthStatus(req: Request): Promise<CmsAuthStatus> {
  const password = getConfiguredPassword();
  if (!password) return 'misconfigured';

  const headerPassword = req.headers.get('x-cms-auth');
  if (headerPassword && isValidCmsPassword(headerPassword)) return 'ok';

  const secret = getSessionSecret();
  const cookies = parseCookies(req.headers.get('cookie'));
  const sessionCookie = cookies[CMS_SESSION_COOKIE];

  if (secret && sessionCookie && await parseSessionPayload(sessionCookie, secret)) {
    return 'ok';
  }

  return 'unauthorized';
}

export async function requireCmsAuth(req: Request) {
  const status = await getCmsAuthStatus(req);
  if (status === 'ok') return null;
  if (status === 'misconfigured') {
    return NextResponse.json(
      { error: 'CMS non configuré : variable CMS_PASSWORD manquante.' },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

export async function createCmsSessionResponse() {
  const sessionToken = await getCmsSessionToken();
  if (!sessionToken) {
    return NextResponse.json(
      { error: 'CMS non configuré : session secret manquant.' },
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
