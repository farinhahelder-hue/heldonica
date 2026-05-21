import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import crypto from 'crypto';

// Analytics API - GA4 REST + JWT
// GOOGLE_SERVICE_ACCOUNT_KEY = contenu JSON brut OU encodé en Base64

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function parseCredentials(raw: string): any {
  let json = raw.trim();
  if (!json.startsWith('{')) {
    json = Buffer.from(json, 'base64').toString('utf-8');
  }
  return JSON.parse(json);
}

async function getAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss:   credentials.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  }));
  const signingInput = `${header}.${payload}`;
  let pem: string = credentials.private_key;
  pem = pem.replace(/\\n/g, '\n').trim();
  const sig = crypto.sign('SHA256', Buffer.from(signingInput), {
    key: pem,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  });
  const jwt = `${signingInput}.${b64url(sig)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth2 token error ${res.status}: ${err}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

async function runReport(token: string, propertyId: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 runReport error ${res.status}: ${err}`);
  }
  return res.json();
}

function metricVal(row: any, index: number): number {
  return parseFloat(row?.metricValues?.[index]?.value ?? '0') || 0;
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const authError = await requireCmsAuth(request);
  if (authError) return authError;

  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY manquante');
    const credentials = parseCredentials(raw);
    const propertyId = process.env.GA4_PROPERTY_ID || '508571761';
    const { startDate = '30daysAgo', endDate = 'today' } = await request.json().catch(() => ({}));
    const dateRanges = [{ startDate, endDate }];

    const token = await getAccessToken(credentials);

    // ── Rapport 1 : métriques globales ──────────────────────────────
    const overview = await runReport(token, propertyId, {
      dateRanges,
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViewsPerSession' },
        { name: 'engagementRate' },
      ],
    });

    const ov = overview.totals?.[0]?.metricValues ?? overview.rows?.[0]?.metricValues ?? [];
    const getOv = (i: number) => parseFloat(ov[i]?.value ?? '0') || 0;

    // ── Rapport 2 : top pages ────────────────────────────────────────
    const pagesData = await runReport(token, propertyId, {
      dateRanges,
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    const topPages = (pagesData.rows ?? []).map((row: any) => ({
      path:  row.dimensionValues?.[0]?.value ?? '/',
      title: row.dimensionValues?.[1]?.value ?? '',
      views: metricVal(row, 0),
      users: metricVal(row, 1),
    }));

    // ── Rapport 3 : sources de trafic ───────────────────────────────
    const sourcesData = await runReport(token, propertyId, {
      dateRanges,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8,
    });

    const trafficSources = (sourcesData.rows ?? []).map((row: any) => ({
      channel: row.dimensionValues?.[0]?.value ?? 'Direct',
      sessions: metricVal(row, 0),
      users:    metricVal(row, 1),
    }));

    // ── Rapport 4 : évolution quotidienne (30j) ──────────────────────
    const dailyData = await runReport(token, propertyId, {
      dateRanges,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    const dailyChart = (dailyData.rows ?? []).map((row: any) => ({
      date:     row.dimensionValues?.[0]?.value ?? '',
      sessions: metricVal(row, 0),
      users:    metricVal(row, 1),
      views:    metricVal(row, 2),
    }));

    // ── Rapport 5 : appareils ────────────────────────────────────────
    const devicesData = await runReport(token, propertyId, {
      dateRanges,
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    });

    const devices = (devicesData.rows ?? []).map((row: any) => ({
      device:   row.dimensionValues?.[0]?.value ?? 'desktop',
      sessions: metricVal(row, 0),
    }));

    return NextResponse.json({
      success: true,
      period: { startDate, endDate },
      totals: {
        sessions:             { value: getOv(0) },
        users:                { value: getOv(1) },
        newUsers:             { value: getOv(2) },
        screenPageViews:      { value: getOv(3) },
        bounceRate:           { value: getOv(4) },
        avgSessionDuration:   { value: getOv(5) },
        pagesPerSession:      { value: getOv(6) },
        engagementRate:       { value: getOv(7) },
      },
      topPages,
      trafficSources,
      dailyChart,
      devices,
    });

  } catch (err: any) {
    console.error('Analytics error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
