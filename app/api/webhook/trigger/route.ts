import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { dispatchWebhook, dispatchValidationFailure } from '@/lib/webhook-dispatcher'
import { requireN8nSecret } from '@/lib/n8n-auth'

// Lazy initialization to avoid build-time crash
const getSupabase = () => {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

// POST /api/webhook/trigger - Manually trigger a webhook event
// Body: { event: 'article.published'|'validation.failed', article_id: number }
// Requires header: x-n8n-secret: <N8N_WEBHOOK_SECRET>

export async function POST(request: NextRequest) {
  // Aucune verification ici jusqu'au 27/10/2026 : un POST anonyme lisait
  // n'importe quel article par son id, brouillons compris (la requete ne
  // filtre pas sur `published`), et declenchait les webhooks sortants
  // n8n / Slack / Discord. Signale par l'audit du 27/07/2026, jamais corrige.
  const refus = requireN8nSecret(request)
  if (refus) return refus

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable - Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { event, article_id } = body

    if (!article_id) {
      return NextResponse.json({ error: 'article_id required' }, { status: 400 })
    }

    // Get article
    const { data: article, error } = await supabase
      .from('cms_blog_posts')
      .select('id,title,slug,category,country,city')
      .eq('id', article_id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const articleData = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      country: article.country,
      city: article.city,
    }

    if (event === 'article.published') {
      await dispatchWebhook('article.published', articleData)
      return NextResponse.json({ success: true, event: 'article.published' })
    }

    if (event === 'article.created') {
      await dispatchWebhook('article.created', articleData)
      return NextResponse.json({ success: true, event: 'article.created' })
    }

    if (event === 'validation.failed') {
      // Get validation issues if provided
      const issues = body.issues || []
      await dispatchValidationFailure(articleData, {
        score: body.score || 50,
        issues,
      })
      return NextResponse.json({ success: true, event: 'validation.failed' })
    }

    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
