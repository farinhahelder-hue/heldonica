export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) supabase = createClient(url, key);
  }
  return supabase;
}

const BUCKET = 'blog-images'

// Simple auth check based on CMS password header
function checkAuth(req: NextRequest) {
  const pwd = req.headers.get('x-cms-password')
  const expected = process.env.CMS_PASSWORD
  if (expected && pwd !== expected) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const authErr = checkAuth(req)
  if (authErr) return authErr

  try {
    const sb = getSupabase();
    if (!sb) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    const { data, error } = await sb.storage
      .from(BUCKET)
      .list('', { limit: 100 })

    if (error) throw error

    const files = (data || []).map((file: any) => ({
      name: file.name,
      createdAt: file.created_at,
      size: file.metadata?.size || 0,
      url: sb.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl
    }))

    return NextResponse.json(files)
  } catch (err) {
    console.error('Storage list error:', err)
    return NextResponse.json({ error: 'Erreur liste' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authErr = checkAuth(req)
  if (authErr) return authErr

  try {
    const body = await req.json()
    const { filename } = body

    if (!filename) {
      return NextResponse.json({ error: 'Filename requis' }, { status: 400 })
    }

    const sb = getSupabase();
    if (!sb) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    const { error } = await sb.storage
      .from(BUCKET)
      .remove([filename])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Storage delete error:', err)
    return NextResponse.json({ error: 'Erreur suppress.' }, { status: 500 })
  }
}