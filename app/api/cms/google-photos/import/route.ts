export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) _supabase = createClient(url, key);
  }
  return _supabase;
}

const BUCKET = 'blog-images'

function checkAuth(req: NextRequest) {
  const pwd = req.headers.get('x-cms-password')
  const expected = process.env.CMS_PASSWORD
  if (expected && pwd !== expected) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const authErr = checkAuth(req)
  if (authErr) return authErr

  try {
    const { imageUrl, filename } = await req.json()

    if (!imageUrl || !filename) {
      return NextResponse.json({ error: 'imageUrl et filename requis' }, { status: 400 })
    }

    // Download image from Google Photos
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return NextResponse.json({ error: 'Erreur download image' }, { status: 400 })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const finalName = `gp-import-${timestamp}-${safeName}`

    // Upload to Supabase Storage
    const { error } = await getSupabase()!.storage
      .from(BUCKET)
      .upload(finalName, buffer, {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Erreur upload: ' + error.message }, { status: 500 })
    }

    const publicUrl = getSupabase()!.storage.from(BUCKET).getPublicUrl(finalName).data.publicUrl

    return NextResponse.json({ success: true, url: publicUrl, filename: finalName })
  } catch (err) {
    console.error('Import error:', err)
    return NextResponse.json({ error: 'Erreur import: ' + String(err) }, { status: 500 })
  }
}