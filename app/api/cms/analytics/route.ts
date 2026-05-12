import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Analytics API - returns real data if GA4 is configured, otherwise demo data.
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
        message: 'Configurer GA4_PROPERTY_ID et GOOGLE_SERVICE_ACCOUNT_KEY dans Vercel pour des données réelles'
      });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountKeyRaw);
    } catch (e) {
      console.error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format', e);
      return NextResponse.json({ success: false, error: 'Configuration GA4 invalide (JSON)' }, { status: 500 });
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
      },
    });

    const body = await request.json().catch(() => ({}));
    const startDate = body.startDate || '30daysAgo';
    const endDate = body.endDate || 'today';

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: 'pagePath',
        },
      ],
      metrics: [
        {
          name: 'sessions',
        },
        {
          name: 'activeUsers',
        },
        {
          name: 'screenPageViews',
        },
        {
          name: 'bounceRate',
        },
      ],
      orderBys: [
        {
          desc: true,
          metric: {
            metricName: 'screenPageViews',
          },
        },
      ],
      limit: 10,
    });

    const rows = response.rows || [];
    const totals = response.totals?.[0]?.metricValues || [];

    return NextResponse.json({
      demo: false,
      rows: rows.map(row => ({
        dimensionValues: row.dimensionValues?.map(d => ({ value: d.value })) || [],
        metricValues: row.metricValues?.map(m => ({ value: m.value })) || [],
      })),
      totals: {
        sessions: { value: parseFloat(totals[0]?.value || '0') },
        users: { value: parseFloat(totals[1]?.value || '0') },
        screenPageViews: { value: parseFloat(totals[2]?.value || '0') },
        bounceRate: { value: parseFloat(totals[3]?.value || '0') }
      },
      configured: true,
      success: true,
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
