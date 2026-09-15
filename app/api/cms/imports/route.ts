export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'

function headersForKey(key: string) {
  const h: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' }
  if (key.startsWith('eyJ')) h['Authorization'] = `Bearer ${key}`
  return h
}

export async function GET(req: NextRequest) {
  const auth = await requireCmsAuth(req as any)
  if (auth) return auth

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  const headers = headersForKey(key)
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  // drafts auto-générés
  const draftsRes = await fetch(
    `${url}/rest/v1/cms_blog_posts?auto_generated=eq.true&select=id,title,slug,created_at,source,source_metadata,published&order=created_at.desc&limit=${limit}`,
    { headers }
  )
  const logsRes = await fetch(
    `${url}/rest/v1/import_logs?select=*&order=created_at.desc&limit=${limit}`,
    { headers }
  )
  const poisRes = await fetch(
    `${url}/rest/v1/article_map_pois?source=in.(gmaps_saved,takeout)&select=id,name,lat,lng,source,address,metadata&order=created_at.desc&limit=${limit}`,
    { headers }
  )

  const drafts = draftsRes.ok ? await draftsRes.json() : []
  const logs = logsRes.ok ? await logsRes.json() : []
  const pois = poisRes.ok ? await poisRes.json() : []

  return NextResponse.json({ drafts, logs, pois })
}
