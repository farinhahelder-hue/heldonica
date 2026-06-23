import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

// POST /api/webhooks/publish-post
// Body: { slug: string, action: 'publish' | 'unpublish' }
// Headers: x-webhook-secret: <WEBHOOK_SECRET>

export async function POST(req: Request) {
  // Verify webhook secret
  const secret = req.headers.get('x-webhook-secret')
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { slug, action } = body

    if (!slug || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, action' },
        { status: 400 }
      )
    }

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "publish" or "unpublish"' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update article status
    const published = action === 'publish'
    const { error: updateError } = await supabase
      .from('articles')
      .update({ 
        published,
        published_at: published ? new Date().toISOString() : null,
      })
      .eq('slug', slug)

    if (updateError) {
      console.error('Error updating article:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Also update cms_blog_posts if it exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('cms_blog_posts') as any)
      .update({
        published,
        published_at: published ? new Date().toISOString() : null,
      })
      .eq('slug', slug)
      .then(() => {})
      .catch(() => {/* ignore if table doesn’t exist */})

    // Revalidate ISR cache
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)

    return NextResponse.json({
      success: true,
      action,
      slug,
      revalidated: ['/blog', `/blog/${slug}`],
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}