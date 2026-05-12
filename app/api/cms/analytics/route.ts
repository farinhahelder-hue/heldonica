import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import crypto from 'crypto';

// Analytics API - uses GA4 Data API via REST with manual JWT signing
// Environment: GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_KEY

function base64urlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getGoogleAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Normalize private key: replace literal \n with actual newlines
  let privateKey = credentials.private_key;
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

    // Sign using private key directly (avoids OpenSSL 3 KeyObject parsing issues)
  console.log('[GA4] key prefix:', privateKey.substring(0, 60).replace(/\n/g, '|'));
  const sign = crypto.createSign('SHA256');
  sign.update(signingInput);
  const signature = sign.sign(privateKey);

  const jwt = `${signingInput}.${base64urlEncode(signature)}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireCmsAuth(request);
    if (authError) return authError;

    const propertyId = process.env.GA4_PROPERTY_ID;
    const serviceAccountKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!propertyId || !serviceAccountKeyRaw) {
      return NextResponse.json({
        demo: true,
        rows: [
          { dimensionValues: [{ value: '/' }], metricValues: [{ value: '1250' }, { value: '980' }, { value: '1250' }, { value: '0.42' }] },
          { dimensionValues: [{ value: '/blog' }], metricValues: [{ value: '890' }, { value: '720' }, { value: '890' }, { value: '0.38' }] },
        ],
        totals: { sessions: { value: 4520 }, users: { value: 3240 }, screenPageViews: { value: 12450 }, bounceRate: { value: 0.42 } },
        configured: false,
        message: 'Configurer GA4_PROPERTY_ID et GOOGLE_SERVICE_ACCOUNT_KEY dans Vercel'
      });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountKeyRaw);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'GOOGLE_SERVICE_ACCOUNT_KEY JSON invalide' }, { status: 500 });
    }

    const accessToken = await getGoogleAccessToken(credentials);

    const body = await request.json().catch(() => ({}));
    const startDate = body.startDate || '30daysAgo';
    const endDate = body.endDate || 'today';

    const gaResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'bounceRate' }],
          orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }],
          limit: 10,
        }),
      }
    );

    if (!gaResponse.ok) {
      const errorText = await gaResponse.text();
      console.error('GA4 API error:', gaResponse.status, errorText);
      return NextResponse.json({ success: false, error: `GA4 API: ${gaResponse.status} - ${errorText}` }, { status: 500 });
    }

    const data = await gaResponse.json();
    const rows = data.rows || [];

    let totalSessions = 0, totalUsers = 0, totalPageViews = 0, totalBounce = 0;
    rows.forEach((row: any) => {
      totalSessions += parseFloat(row.metricValues?.[0]?.value || '0');
      totalUsers += parseFloat(row.metricValues?.[1]?.value || '0');
      totalPageViews += parseFloat(row.metricValues?.[2]?.value || '0');
      totalBounce += parseFloat(row.metricValues?.[3]?.value || '0');
    });

    return NextResponse.json({
      demo: false,
      rows: rows.map((row: any) => ({
        dimensionValues: row.dimensionValues?.map((d: any) => ({ value: d.value })) || [],
        metricValues: row.metricValues?.map((m: any) => ({ value: m.value })) || [],
      })),
      totals: {
        sessions: { value: totalSessions },
        users: { value: totalUsers },
        screenPageViews: { value: totalPageViews },
        bounceRate: { value: rows.length > 0 ? totalBounce / rows.length : 0 },
      },
      configured: true,
      success: true,
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
