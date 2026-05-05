import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseKey)

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
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 100 })

    if (error) throw error

    const files = (data || []).map(file => ({
      name: file.name,
      createdAt: file.created_at,
      size: file.metadata?.size || 0,
      url: supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl
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

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([filename])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Storage delete error:', err)
    return NextResponse.json({ error: 'Erreur suppress.' }, { status: 500 })
  }
}