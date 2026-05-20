import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatchWebhook, dispatchValidationFailure } from '@/lib/webhook-dispatcher'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/webhook/trigger - Manually trigger a webhook event
// Body: { event: 'article.published'|'validation.failed', article_id: number }

export async function POST(request: NextRequest) {
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