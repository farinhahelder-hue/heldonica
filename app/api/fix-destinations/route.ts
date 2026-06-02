import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST() {
  try {
    const results = []

    // Tâche 1: Fix Paris image
    const { error: parisError } = await supabase
      .from('destinations')
      .update({ 
        featured_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'
      })
      .eq('slug', 'paris-canal-marais')

    results.push({
      task: 'fix_paris_image',
      status: parisError ? 'error' : 'success',
      error: parisError?.message
    })

    // Tâche 2: Seed 3 test articles if cms_blog_posts is empty
    const { count } = await supabase
      .from('cms_blog_posts')
      .select('*', { count: 'exact', head: true })

    if (count === 0) {
      const articles = [
        {
          title: "Madère en mars : ce que personne ne te dit",
          slug: "madere-en-mars",
          excerpt: "On y retourne chaque année et chaque fois l'île nous surprend. Voici ce qu'on a appris à force de revenir.",
          category: "Carnets de voyage",
          status: 'published',
          published_at: '2026-05-15',
          featured_image: 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80',
          author: 'Heldonica',
        },
        {
          title: "Pourquoi le slow travel change la façon dont on revient",
          slug: "slow-travel-retour",
          excerpt: "Ce n'est pas le voyage qui change, c'est ce qu'on ramène dans nos façons de vivre au quotidien.",
          category: "Découvertes",
          status: 'published',
          published_at: '2026-04-28',
          featured_image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
          author: 'Heldonica',
        },
        {
          title: "Roumanie : les villages que les guides ne mentionnent pas",
          slug: "roumanie-villages-caches",
          excerpt: "Entre Sibiu et Sighișoara, il y a des routes qui n'existent que si tu sais les chercher.",
          category: "Découvertes",
          status: 'published',
          published_at: '2026-04-10',
          featured_image: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=800&q=80',
          author: 'Heldonica',
        },
      ]

      const { error: insertError } = await supabase
        .from('cms_blog_posts')
        .insert(articles)

      results.push({
        task: 'seed_blog_articles',
        status: insertError ? 'error' : 'success',
        count: insertError ? 0 : 3,
        error: insertError?.message
      })
    } else {
      results.push({
        task: 'seed_blog_articles',
        status: 'skipped',
        reason: `cms_blog_posts already has ${count} articles`
      })
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (err) {
    console.error('Fix destinations error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}