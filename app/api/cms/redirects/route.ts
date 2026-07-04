import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { data: redirects, error } = await supabase
      .from('cms_redirects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[CMS Redirects GET] Fetch error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirects })
  } catch (err) {
    console.error('[CMS Redirects GET] Error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { from_path, to_path, redirect_type, active } = body

    if (!from_path || !to_path) {
      return NextResponse.json({ error: 'Champs requis manquants: from_path et to_path' }, { status: 400 })
    }

    const { data: newRedirect, error } = await supabase
      .from('cms_redirects')
      .insert({
        from_path,
        to_path,
        redirect_type: redirect_type || 301,
        active: active !== undefined ? active : true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirect: newRedirect })
  } catch (err) {
    console.error('[CMS Redirects POST] Error:', err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { id, from_path, to_path, redirect_type, active } = body

    if (!id) {
      return NextResponse.json({ error: 'Id manquant' }, { status: 400 })
    }

    const { data: updatedRedirect, error } = await supabase
      .from('cms_redirects')
      .update({
        from_path,
        to_path,
        redirect_type,
        active,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirect: updatedRedirect })
  } catch (err) {
    console.error('[CMS Redirects PATCH] Error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Id manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cms_redirects')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CMS Redirects DELETE] Error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
