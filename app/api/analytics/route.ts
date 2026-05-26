import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    const serviceAccountKey = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'
    )

    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccountKey.client_email,
        private_key: serviceAccountKey.private_key,
      },
    })

    const [response] = await client.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'engagementRate' },
      ],
    })

    const metrics = response.rows?.[0]?.metricValues || []

    return NextResponse.json({
      sessions: parseInt(metrics[0]?.value || '0'),
      users: parseInt(metrics[1]?.value || '0'),
      newUsers: parseInt(metrics[2]?.value || '0'),
      pageViews: parseInt(metrics[3]?.value || '0'),
      bounceRate: parseFloat(metrics[4]?.value || '0'),
      avgSessionDuration: parseFloat(metrics[5]?.value || '0'),
      engagementRate: parseFloat(metrics[6]?.value || '0'),
    })
  } catch (error) {
    console.error('GA4 API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
