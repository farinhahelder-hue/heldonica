import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
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

    const { data: guides, error } = await supabase
      .from('travel_guides')
      .select('destination_slug, title, subtitle, cover_unsplash_url')
      .order('title', { ascending: true })

    if (error) {
      console.error('[CMS Travel Guides GET] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, guides })
  } catch (err) {
    console.error('[CMS Travel Guides GET] Error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
