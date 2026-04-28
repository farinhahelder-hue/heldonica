import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { getUploadUrl, getPublicUrl } from '@/lib/s3-media'

export async function POST(req: NextRequest) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  try {
    const { filename, contentType } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Filename et contentType requis' }, { status: 400 })
    }

    // Generate unique key with timestamp
    const timestamp = Date.now()
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `media/${timestamp}-${safeName}`

    const uploadUrl = await getUploadUrl(key, contentType)
    const publicUrl = getPublicUrl(key)

    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch (err) {
    console.error('Media upload error:', err)
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
  }
}