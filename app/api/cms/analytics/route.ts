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
  // Supporte Base64 ET JSON brut
  let json = raw.trim();
  if (!json.startsWith('{')) {
    // C'est du Base64 — on décode
    json = Buffer.from(json, 'base64').toString('utf-8');
  }
  return JSON.parse(json);
}

async function getAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header  = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss:   credentials.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  }));
  const signingInput = `${header}.${payload}`;

  // Normalisation clé privée
  let pem: string = credentials.private_key;
  pem = pem.replace(/\\n/g, '\n').trim();

  // Signature RSA-SHA256
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
  return (await res.json()).access_token as string;
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireCmsAuth(request);
    if (authError) return authError;

    const propertyId = process.env.GA4_PROPERTY_ID;
    const keyRaw     = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!propertyId || !keyRaw) {
      return NextResponse.json({
        demo: true, configured: false,
        rows: [],
        totals: { sessions: { value: 0 }, users: { value: 0 }, screenPageViews: { value: 0 }, bounceRate: { value: 0 } },
        message: 'Configurer GA4_PROPERTY_ID et GOOGLE_SERVICE_ACCOUNT_KEY dans Vercel',
      });
    }

    let credentials: any;
    try {
      credentials = parseCredentials(keyRaw);
    } catch (e: any) {
      console.error('Credentials parse error:', e.message);
      return NextResponse.json({ success: false, error: `Credentials invalides: ${e.message}` }, { status: 500 });
    }

    const token = await getAccessToken(credentials);

    const body = await request.json().catch(() => ({}));
    const startDate: string = body.startDate || '30daysAgo';
    const endDate:   string = body.endDate   || 'today';

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
          ],
          orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }],
          limit: 10,
        }),
      }
    );

    if (!gaRes.ok) {
      const errText = await gaRes.text();
      console.error('GA4 API error:', gaRes.status, errText);
      return NextResponse.json({ success: false, error: `GA4 API ${gaRes.status}: ${errText}` }, { status: 500 });
    }

    const data = await gaRes.json();
    const rows: any[] = data.rows || [];
    let s = 0, u = 0, pv = 0, br = 0;
    rows.forEach((r: any) => {
      s  += parseFloat(r.metricValues?.[0]?.value || '0');
      u  += parseFloat(r.metricValues?.[1]?.value || '0');
      pv += parseFloat(r.metricValues?.[2]?.value || '0');
      br += parseFloat(r.metricValues?.[3]?.value || '0');
    });

    return NextResponse.json({
      demo: false, configured: true, success: true,
      rows: rows.map((r: any) => ({
        dimensionValues: r.dimensionValues?.map((d: any) => ({ value: d.value })) || [],
        metricValues:    r.metricValues?.map((m: any)  => ({ value: m.value }))  || [],
      })),
      totals: {
        sessions:        { value: s },
        users:           { value: u },
        screenPageViews: { value: pv },
        bounceRate:      { value: rows.length > 0 ? br / rows.length : 0 },
      },
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
