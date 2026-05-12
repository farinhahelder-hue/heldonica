import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { GoogleAuth } from 'google-auth-library';

// Analytics API - uses GA4 Data API via REST (compatible with Vercel serverless)
// Environment: GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_KEY

export async function POST(request: NextRequest) {
  try {
    const authError = await requireCmsAuth(request);
    if (authError) return authError;

    const propertyId = process.env.GA4_PROPERTY_ID;
    const serviceAccountKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!propertyId || !serviceAccountKeyRaw) {
      // Demo data (fallback if not configured)
      return NextResponse.json({
        demo: true,
        rows: [
          { dimensionValues: [{ value: '/' }, { value: '1250' }] },
          { dimensionValues: [{ value: '/a-propos' }, { value: '420' }] },
          { dimensionValues: [{ value: '/services' }, { value: '380' }] },
          { dimensionValues: [{ value: '/travel-planning' }, { value: '520' }] },
          { dimensionValues: [{ value: '/blog' }, { value: '890' }] }
        ],
        totals: {
          sessions: { value: 4520 },
          users: { value: 3240 },
          screenPageViews: { value: 12450 },
          bounceRate: { value: 0.42 }
        },
        configured: false,
        message: 'Configurer GA4_PROPERTY_ID et GOOGLE_SERVICE_ACCOUNT_KEY dans Vercel pour des donnees reelles'
      });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountKeyRaw);
    } catch (e) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format', e);
      return NextResponse.json({ success: false, error: 'Configuration GA4 invalide (JSON)' }, { status: 500 });
    }

    // Normalize private key newlines
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    // Use GoogleAuth with REST transport (no gRPC)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const body = await request.json().catch(() => ({}));
    const startDate = body.startDate || '30daysAgo';
    const endDate = body.endDate || 'today';

    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    const gaResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
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
        returnPropertyQuota: false,
        keepEmptyRows: false,
      }),
    });

    if (!gaResponse.ok) {
      const errorText = await gaResponse.text();
      console.error('GA4 API error:', gaResponse.status, errorText);
      return NextResponse.json({ success: false, error: `GA4 API error: ${gaResponse.status}` }, { status: 500 });
    }

    const data = await gaResponse.json();
    const rows = data.rows || [];

    // Compute totals by summing all rows
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
