import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

// POST /api/cms/recalculate-reading-times
// Protected by CMS auth - admin only
// Recalculates reading_time for all articles

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: Request) {
  // Verify CMS auth
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    )
  }

  // Get all articles
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, slug, content')

  if (fetchError) {
    console.error('Error fetching articles:', fetchError)
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    )
  }

  if (!articles || articles.length === 0) {
    return NextResponse.json({
      success: true,
      updated: 0,
      message: 'No articles found',
    })
  }

  // Calculate and update reading_time for each article
  const updates: { id: number; read_time: number }[] = []

  for (const article of articles) {
    if (article.content) {
      const wordCount = article.content
        .replace(/<[^>]+>/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length
      const readTime = Math.ceil(wordCount / 200)
      updates.push({ id: article.id, read_time: readTime })
    }
  }

  // Batch update in articles table
  let updatedCount = 0
  for (const update of updates) {
    const { error } = await supabase
      .from('articles')
      .update({ read_time: update.read_time })
      .eq('id', update.id)

    if (!error) updatedCount++
  }

  // La table cms_blog_posts n'a pas de colonne read_time — verifie sur la base.
  // Une seconde boucle tentait l'ecriture « au cas ou », en ignorant l'erreur :
  // elle envoyait donc autant de requetes vouees a l'echec qu'il y a
  // d'articles, a chaque execution.
  //
  // Le filet ne tenait pas davantage : PostgREST renvoie ses erreurs dans le
  // resultat et non par un rejet, si bien que le .catch ne se declenchait
  // jamais et que le .then vide les avalait toutes.
  //
  // Le temps de lecture vit dans articles.read_time, mis a jour au-dessus.

  return NextResponse.json({
    success: true,
    updated: updatedCount,
    total: articles.length,
  })
}