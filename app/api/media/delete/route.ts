import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { deleteMedia } from '@/lib/s3-media'

export async function POST(req: NextRequest) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  try {
    const { key } = await req.json()

    if (!key) {
      return NextResponse.json({ error: 'Key requis' }, { status: 400 })
    }

    await deleteMedia(key)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Media delete error:', err)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}