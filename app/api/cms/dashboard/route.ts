import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    // 1. Brouillons en attente (published = FALSE)
    const { data: drafts } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, category, updated_at')
      .eq('published', false)
      .order('updated_at', { ascending: false })
      .limit(5)

    // 2. Nouvelles demandes Travel Planning (statut = 'nouveau')
    // Fallback if status column doesn't exist yet (we'll query without it, or handle error gracefully)
    let newRequests = []
    const { data: requests, error: reqError } = await supabase
      .from('cms_demandes_travel')
      .select('id, prenom, nom, email, destination, budget_fourchette, style_voyage, statut, created_at')
      .eq('statut', 'nouveau')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!reqError && requests) {
       newRequests = requests
    } else {
       // If column 'statut' doesn't exist, we fallback
       const { data: allReqs } = await supabase
        .from('cms_demandes_travel')
        .select('id, prenom, nom, email, destination, budget_fourchette, style_voyage, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
       newRequests = allReqs || []
    }

    // 3. Alertes articles programmés bloqués
    const { data: scheduledAlerts } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, published_at')
      .eq('published', false)
      .not('published_at', 'is', null)
      .lt('published_at', new Date().toISOString())

    // 4. Statistiques rapides
    const { count: publishedCount } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    const { count: draftCount } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', false)

    let requestsCount = 0
    const { count: reqCount, error: countErr } = await supabase
      .from('cms_demandes_travel')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'nouveau')

    if (!countErr) {
       requestsCount = reqCount || 0
    }

    return NextResponse.json({
      success: true,
      drafts: drafts || [],
      newRequests: newRequests || [],
      scheduledAlerts: scheduledAlerts || [],
      stats: {
        publishedCount: publishedCount || 0,
        draftCount: draftCount || 0,
        requestsCount: requestsCount || 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
