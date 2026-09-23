import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

// Table volontairement fermée à anon (service_role only) : lecture serveur.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export interface SharePack {
  id: string
  image_url: string
  caption: string
  hashtags: string[]
  status: string
  article_id: number | string | null
}

/**
 * GET /api/cms/share-pack?post_id=<uuid>
 * Pont CMS → Instagram SANS appel à l'API Meta : renvoie le pack prêt à
 * publier à la main (image + légende) depuis la file instagram_scheduled_posts.
 * La page /panel-manager/partage-manuel s'en sert pour copier / télécharger /
 * marquer comme publié, sans aucun token Meta.
 */
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  }

  const postId = new URL(req.url).searchParams.get('post_id')
  if (!postId) {
    return NextResponse.json({ error: 'post_id requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('instagram_scheduled_posts')
    .select('id, image_url, caption, hashtags, status, article_id')
    .eq('id', postId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })
  }

  const pack: SharePack = {
    id: String((data as any).id),
    image_url: (data as any).image_url || '',
    caption: (data as any).caption || '',
    hashtags: Array.isArray((data as any).hashtags) ? (data as any).hashtags : [],
    status: (data as any).status || 'draft',
    article_id: (data as any).article_id ?? null,
  }

  return NextResponse.json(
    { pack },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
