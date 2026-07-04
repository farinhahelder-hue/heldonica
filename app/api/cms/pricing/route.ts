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
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'

    let query = supabase
      .from('cms_pricing_plans')
      .select('*')
      .order('display_order', { ascending: true })

    if (!all) {
      query = query.eq('active', true)
    } else {
      const authResponse = await requireCmsAuth(req)
      if (authResponse) return authResponse
    }

    const { data: plans, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plans })
  } catch (err) {
    console.error('[CMS Pricing GET] Error:', err)
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
    const { slug, name, price, description, features, is_popular, display_order, active } = body

    if (!slug || !name || !price) {
      return NextResponse.json({ error: 'Slug, nom et prix requis' }, { status: 400 })
    }

    // Handle single popular plan rule: if this plan is popular, turn off others
    if (is_popular) {
      await supabase
        .from('cms_pricing_plans')
        .update({ is_popular: false })
        .eq('is_popular', true)
    }

    const { data: newPlan, error } = await supabase
      .from('cms_pricing_plans')
      .insert({
        slug,
        name,
        price,
        description,
        features: features || [],
        is_popular: is_popular || false,
        display_order: display_order || 0,
        active: active !== undefined ? active : true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: newPlan })
  } catch (err) {
    console.error('[CMS Pricing POST] Error:', err)
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 })
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
    const { id, is_popular, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Id requis' }, { status: 400 })
    }

    // Handle single popular plan rule: if setting this plan to popular, turn off others
    if (is_popular) {
      await supabase
        .from('cms_pricing_plans')
        .update({ is_popular: false })
        .eq('is_popular', true)
    }

    const { data: updatedPlan, error } = await supabase
      .from('cms_pricing_plans')
      .update({
        ...updates,
        is_popular: is_popular !== undefined ? is_popular : false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: updatedPlan })
  } catch (err) {
    console.error('[CMS Pricing PATCH] Error:', err)
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
      return NextResponse.json({ error: 'Id requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cms_pricing_plans')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CMS Pricing DELETE] Error:', err)
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
