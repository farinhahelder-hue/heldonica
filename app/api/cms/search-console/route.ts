import { NextRequest, NextResponse } from 'next/server';

// Search Console API - returns demo data if not configured

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo data
    return NextResponse.json({
      demo: true,
      rows: [
        { keys: ['hotel boutique france'], clicks: 245, impressions: 8920, ctr: 0.027, position: 8.5 },
        { keys: ['hotel independant'], clicks: 189, impressions: 6540, ctr: 0.029, position: 6.2 },
        { keys: ['conseil hotel'], clicks: 156, impressions: 4200, ctr: 0.037, position: 4.8 },
        { keys: ['formation hotel'], clicks: 142, impressions: 3800, ctr: 0.037, position: 5.1 },
        { keys: ['travel planning'], clicks: 98, impressions: 2400, ctr: 0.041, position: 7.3 }
      ],
      configured: false,
      message: 'Configurer Google Search Console API pour des données réelles'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}