import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { signToken } from '@/lib/preview-token'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const slug = new URL(req.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const payload = JSON.stringify({ slug, exp: Date.now() + 60 * 60 * 1000 })
  const sig = await signToken(payload)
  const token = `${btoa(payload)}.${sig}`

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr'
  const previewUrl = `${baseUrl}/blog/${slug}?preview_token=${token}`

  return NextResponse.json({ token, previewUrl })
}
