import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const sb = supabase()
    if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'media'
    const bucket = (formData.get('bucket') as string) || 'heldonica-media'
    
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await sb.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (error) {
      return NextResponse.json({ error: `Storage: ${error.message}` }, { status: 500 })
    }

    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(filename)
    return NextResponse.json({ url: urlData.publicUrl, path: filename, success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
