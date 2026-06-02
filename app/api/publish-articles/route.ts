import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST() {
  try {
    // Find Maramureș article
    const { data: maramures } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, status')
      .ilike('title', '%maramure%')

    // Find Stoos article
    const { data: stoos } = await supabase
      .from('cms_blog_posts')
      .select('id, title, slug, status')
      .ilike('title', '%stoos%')

    const results = []

    // Publish Maramureș
    if (maramures && maramures.length > 0) {
      const { error } = await supabase
        .from('cms_blog_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', maramures[0].id)
      
      results.push({
        task: 'publish_maramures',
        status: error ? 'error' : 'success',
        article: maramures[0].title,
        error: error?.message
      })
    } else {
      results.push({
        task: 'publish_maramures',
        status: 'not_found',
        article: null
      })
    }

    // Publish Stoos
    if (stoos && stoos.length > 0) {
      const { error } = await supabase
        .from('cms_blog_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', stoos[0].id)
      
      results.push({
        task: 'publish_stoos',
        status: error ? 'error' : 'success',
        article: stoos[0].title,
        error: error?.message
      })
    } else {
      results.push({
        task: 'publish_stoos',
        status: 'not_found',
        article: null
      })
    }

    // Get total published count
    const { count } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    return NextResponse.json({
      success: true,
      published_count: count,
      results
    })
  } catch (err) {
    console.error('Publish articles error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}