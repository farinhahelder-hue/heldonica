import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { deleteMedia } from '@/lib/s3-media'

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const { key } = await req.json()

    if (!key) {
      return NextResponse.json({ error: 'Key requis' }, { status: 400 })
    }

    await deleteMedia(key)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Media delete error:', err)
    if (err.message === 'S3 not configured') {
      return NextResponse.json({ error: 'S3 non configuré' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
