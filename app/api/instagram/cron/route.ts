import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Le cron tourne côté serveur : clé service_role. La table
// instagram_scheduled_posts est volontairement fermée à anon
// (migration 20260915000002, « service_role only »).
function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = getSupabaseService()
    if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

    const now = new Date().toISOString()
    const { data: duePosts, error: fetchError } = await (supabase as any)
      .from('instagram_scheduled_posts')
      .select('id, image_url, caption, article_id, metadata')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .limit(5)

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const results: { id: string; status: string; error?: string }[] = []

    for (const post of duePosts || []) {
      try {
        // Meme point d'entree que le bouton « Publier » du panneau : le cron
        // publiait tout en image seule et perdait carrousels et reels.
        const { publierEntreeFile } = await import('@/lib/instagram')
        const resultat = await publierEntreeFile({
          image_url: post.image_url,
          caption: post.caption,
          metadata: post.metadata,
        })
        const result = resultat.ok ? resultat.post : null
        if (result) {
          // Si ce statut n'est pas ecrit, le meme post repart au prochain
          // passage : deux publications identiques sur le compte.
          const { error: erreurStatut } = await (supabase as any)
            .from('instagram_scheduled_posts')
            .update({ status: 'published', published_at: now, permalink: result.permalink, error_message: null })
            .eq('id', post.id)
          if (erreurStatut) {
            console.error('[instagram/cron] statut publie non enregistre :', erreurStatut.message)
          }
          results.push({ id: post.id, status: 'published' })
        } else {
          throw new Error(resultat.ok ? 'Échec publication Instagram' : resultat.raison)
        }
      } catch (err: any) {
        const { error: erreurEchec } = await (supabase as any)
          .from('instagram_scheduled_posts')
          .update({ status: 'failed', error_message: err.message })
          .eq('id', post.id)
        if (erreurEchec) {
          console.error('[instagram/cron] statut echec non enregistre :', erreurEchec.message)
        }
        results.push({ id: post.id, status: 'failed', error: err.message })
      }
    }

    return NextResponse.json({ processed: results.length, results })
  } catch (err: any) {
    console.error('Instagram cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
