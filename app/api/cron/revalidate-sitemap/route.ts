import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const CRON_SECRET = process.env.CRON_SECRET

// GET /api/cron/revalidate-sitemap
// Revalidates the sitemap.xml daily
// Protected by CRON_SECRET Bearer token

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!CRON_SECRET || token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Revalidate sitemap
    revalidatePath('/sitemap.xml')

    // Also revalidate blog index for fresh content
    revalidatePath('/blog')

    return NextResponse.json({
      success: true,
      revalidated: ['/sitemap.xml', '/blog'],
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
