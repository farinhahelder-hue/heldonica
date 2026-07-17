import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceMode } from '@/lib/supabase-edge';

// Inline legacy redirect logic (duplicated from app/middleware.ts to avoid edge runtime issues)
const LEGACY_REDIRECTS: Record<string, string> = {
  '/a-propos-2': '/a-propos',
  '/presentation-3': '/a-propos',
  '/hello-biz-360': '/travel-planning',
  '/accueil-heldonica-video': '/',
  '/b2b': '/travel-planning',
  '/offre-b2b': '/travel-planning',
  '/services-b2b': '/travel-planning',
  '/travel-planner': '/travel-planning',
  '/nos-services': '/travel-planning',
  '/bons-plans': '/blog',
  '/sujets/bons-plans': '/blog',
  '/zurich': '/destinations/zurich',
  '/suisse': '/destinations/suisse',
  '/roumanie': '/destinations/roumanie',
  '/madere': '/destinations/madere',
  '/stoos-ridge-notre-aventure-sur-la-crete-panoramique-2':
    '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique',
  '/blog/stoos-ridge-coucher-soleil-traversee-funiculaire':
    '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique',
  '/blog/stoos-ridge-notre-aventure-crete-panoramique':
    '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique',
  '/blog/stoos-ridge-la-crete-pano':
    '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique',
};

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function resolveLegacyRedirect(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const directRedirect = LEGACY_REDIRECTS[normalized];
  if (directRedirect) return directRedirect;
  if (normalized.startsWith('/etiquettes/')) return '/blog';
  if (normalized.startsWith('/sujets/')) return '/blog';
  return null;
}

const PROTECTED_PATHS = [
  '/api/seed-articles',
  '/api/revalidate-articles',
  '/api/update-content',
];
const PROTECTED_PREFIXES = [
  '/api/cms',
  '/api/agents',
  // /panel-manager a son propre écran de login React — pas besoin de le protéger ici
];
const CMS_SESSION_COOKIE = 'heldonica_cms_session';

type CmsSessionPayload = {
  exp: number;
  iat: number;
  sid: string;
};

function isProtectedPath(pathname: string) {
  // Allow auth endpoints without authentication (including sub-routes like /check, /logout)
  if (pathname === '/api/cms/auth' || pathname === '/api/cms/login' ||
      pathname.startsWith('/api/cms/auth/')) {
    return false;
  }

  // Check prefix patterns
  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return PROTECTED_PATHS.includes(pathname);
}

function getSessionSecret() {
  const secret = process.env.CMS_SESSION_SECRET?.trim();
  return secret ? secret : process.env.CMS_PASSWORD?.trim() ?? null;
}

function getSubtle(): SubtleCrypto | null {
  const c = globalThis.crypto;
  return c?.subtle ?? null;
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

  const subtle = getSubtle();
  if (!subtle) return false;

  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) {
    return false;
  }

  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const isValidSignature = await subtle.verify(
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

// Fallback code — écrasé par MAINTENANCE_MODE (Vercel) ou CMS (Supabase)
const MAINTENANCE_ACTIVE = true;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const maintenanceExcludes = ['/maintenance', '/panel-manager', '/cms-admin', '/api', '/_next', '/robots.txt', '/sitemap.xml', '/favicon.ico'];
  const isMaintenanceExcluded = maintenanceExcludes.some(path => pathname.startsWith(path));

  if (!isMaintenanceExcluded) {
    // Priorité 1 : variable Vercel MAINTENANCE_MODE (sans Supabase, nécessite redéploiement)
    //   → Vercel dashboard > Project Settings > Environment Variables > MAINTENANCE_MODE = true/false
    //   → puis "Redeploy latest deployment" (~2 min)
    const envMode = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
    let isMaintenance: boolean;

    if (envMode === 'false' || envMode === '0') {
      isMaintenance = false;                          // env var force OFF
    } else if (envMode === 'true' || envMode === '1') {
      isMaintenance = true;                           // env var force ON
    } else {
      // Priorité 2 : CMS Supabase (sans redéploiement, si Supabase actif)
      const cmsValue = await getMaintenanceMode();
      isMaintenance = cmsValue !== null ? cmsValue : MAINTENANCE_ACTIVE;
    }

    if (isMaintenance) {
      const maintenanceUrl = req.nextUrl.clone();
      maintenanceUrl.pathname = '/maintenance';
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // Legacy redirect
  const redirectDestination = resolveLegacyRedirect(pathname);

  if (redirectDestination) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = redirectDestination;

    return NextResponse.redirect(redirectUrl, 301);
  }

  if (!isProtectedPath(pathname)) {
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
