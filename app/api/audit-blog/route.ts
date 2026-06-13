import { NextResponse } from 'next/server'
import { supabase } from '@/lib/blog-supabase'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    // Check both column names
    const { data: byPublished, count: countByPublished } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    const { data: byStatus, count: countByStatus } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get actual articles with published=true
    const { data: publishedPosts } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, published, status, featured_image, excerpt')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    // Get articles with status=published but published=false
    const { data: statusPosts } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, published, status')
      .eq('status', 'published')
      .eq('published', false)
      .limit(10)

    // Count total
    const { count: totalCount } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })

    // Count without image
    const { count: noImageCount } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .or('featured_image.is.null,featured_image.eq.')

    // Count without excerpt
    const { count: noExcerptCount } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .or('excerpt.is.null,excerpt.eq.')

    return NextResponse.json({
      diagnostics: {
        total_articles: totalCount,
        using_published_column: {
          count: countByPublished,
          sample: publishedPosts?.slice(0, 5)
        },
        using_status_column: {
          count: countByStatus,
          sample: statusPosts
        },
        seo_audit: {
          without_image: noImageCount,
          without_excerpt: noExcerptCount
        }
      },
      recommendation: countByStatus && countByStatus > (countByPublished || 0) 
        ? 'Use status=published instead of published=true'
        : 'Query appears correct'
    })
  } catch (err) {
    console.error('Blog audit error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Fix: Sync status='published' with published=true
export async function POST() {
  let adminClient;
  try {
    adminClient = createServiceClient();
  } catch (e) {
    return NextResponse.json({ error: 'Supabase service client not configured' }, { status: 500 })
  }

  try {
    // Fix articles that have status='published' but published=false
    const { data, error } = await adminClient
      .from('cms_blog_posts')
      .update({ published: true })
      .eq('status', 'published')
      .eq('published', false)
      .select()

    return NextResponse.json({
      fixed: error ? 0 : ((data as unknown as any[])?.length || 0),
      error: error?.message
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}