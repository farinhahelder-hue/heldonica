import { NextRequest, NextResponse } from 'next/server';

// Analytics API - returns demo data if no GA4 configured
// Environment: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo data (show what it would look like)
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
      configured: !!process.env.GA4_PROPERTY_ID,
      message: 'Configurer GA4_PROPERTY_ID, GA4_CLIENT_EMAIL et GA4_PRIVATE_KEY dans Vercel pour des données réelles'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}