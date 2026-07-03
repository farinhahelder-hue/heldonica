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

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { data: categories, error } = await supabase
      .from('cms_blog_categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[CMS Categories GET] Fetch error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, categories })
  } catch (err) {
    console.error('[CMS Categories GET] Error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const body = await req.json()
    const { action, slug, label, db_value, display_order } = body

    // Handle Normalization action
    if (action === 'normalize') {
      let articlesUpdated = 0
      let cmsBlogPostsUpdated = 0
      
      // We will perform updates in block
      const { data: articlesData, error: articlesErr } = await supabase
        .from('articles')
        .update({ category: 'Carnets Voyage' })
        .in('category', ['Carnets de voyage', 'Carnets de Voyage', 'carnets de voyage', 'carnets'])
        .select('id')

      if (!articlesErr && articlesData) articlesUpdated = articlesData.length

      // Normalize "cms_blog_posts" table if it exists
      const { data: postsData, error: postsErr } = await supabase
        .from('cms_blog_posts')
        .update({ category: 'Carnets Voyage' })
        .in('category', ['Carnets de voyage', 'Carnets de Voyage', 'carnets de voyage', 'carnets'])
        .select('id')

      if (!postsErr && postsData) cmsBlogPostsUpdated = postsData.length

      return NextResponse.json({
        success: true,
        message: 'Normalisation effectuee avec succes',
        normalizedCount: articlesUpdated + cmsBlogPostsUpdated,
      })
    }

    // Creating a category
    if (!slug || !label || !db_value) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { data: newCategory, error } = await supabase
      .from('cms_blog_categories')
      .insert({
        slug,
        label,
        db_value,
        display_order: display_order || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: newCategory })
  } catch (err) {
    console.error('[CMS Categories POST] Error:', err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const body = await req.json()
    const { id, slug, label, db_value, display_order } = body

    if (!id) {
      return NextResponse.json({ error: 'Id manquant' }, { status: 400 })
    }

    // Fetch existing category to check for db_value changes (cascade update)
    const { data: existing } = await supabase
      .from('cms_blog_categories')
      .select('db_value')
      .eq('id', id)
      .single()

    const { data: updatedCategory, error } = await supabase
      .from('cms_blog_categories')
      .update({
        slug,
        label,
        db_value,
        display_order,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cascade update to articles/posts category columns if db_value changed
    if (existing && existing.db_value !== db_value) {
      await supabase
        .from('articles')
        .update({ category: db_value })
        .eq('category', existing.db_value)

      await supabase
        .from('cms_blog_posts')
        .update({ category: db_value })
        .eq('category', existing.db_value)
    }

    return NextResponse.json({ success: true, category: updatedCategory })
  } catch (err) {
    console.error('[CMS Categories PATCH] Error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Id manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cms_blog_categories')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CMS Categories DELETE] Error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
