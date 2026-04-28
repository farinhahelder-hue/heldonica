import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { listMedia } from '@/lib/s3-media'

export async function GET(req: NextRequest) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  try {
    const media = await listMedia()
    return NextResponse.json(media)
  } catch (err) {
    console.error('Media list error:', err)
    return NextResponse.json({ error: 'Erreur liste média' }, { status: 500 })
  }
}