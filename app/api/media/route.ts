import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { listMedia } from '@/lib/s3-media'

export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const media = await listMedia()
    return NextResponse.json(media)
  } catch (err) {
    console.error('Media list error:', err)
    return NextResponse.json({ error: 'S3 non configuré ou erreur de connexion' }, { status: 200 })
  }
}
