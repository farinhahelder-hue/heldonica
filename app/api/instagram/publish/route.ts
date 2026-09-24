import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { isInstagramConfigured, publierEntreeFile } from '@/lib/instagram'

export const dynamic = 'force-dynamic'
// Un reel attend la fin du traitement Meta (jusqu'a 90 s de polling).
export const maxDuration = 120

/**
 * POST /api/instagram/publish — publie maintenant une entree de la file.
 *
 * Body : { id: string } — identifiant dans `instagram_scheduled_posts`.
 *
 * Le panneau avait un bouton « Marquer comme publie » qui ne faisait que
 * changer le statut : rien ne partait sur le compte, et la file affichait
 * « published » sur des posts qui n'existaient pas. Cette route publie
 * vraiment — image, carrousel ou reel selon `metadata.type` — puis ecrit le
 * statut, le permalien ou la raison d'echec, exactement comme le cron.
 *
 * Un `draft` est publiable : c'est le geste de validation depuis le PC apres
 * un envoi depuis le telephone. Un `published` ne se republie pas (409).
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const refus = await requireCmsAuth(req)
  if (refus) return refus
  // Chaque appel peut declencher jusqu'a 12 requetes Meta (carrousel) : la
  // limite est volontairement basse.
  if (!rateLimit(getClientIp(req), 5, 60_000)) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
  }

  if (!isInstagramConfigured()) {
    // Dire quoi poser et ou, plutot qu'un « echec » que le panneau ne peut pas
    // expliquer. C'est la premiere marche de l'Option A : sans ces deux
    // variables, rien de ce qui suit ne peut fonctionner.
    return NextResponse.json(
      {
        error: 'Instagram non configure',
        detail:
          'Poser INSTAGRAM_ACCESS_TOKEN (token longue duree Meta) et ' +
          'INSTAGRAM_BUSINESS_ACCOUNT_ID dans les variables Vercel, puis redeployer.',
        configured: false,
      },
      { status: 503 }
    )
  }

  let id: string | undefined
  try {
    const body = await req.json()
    id = typeof body?.id === 'string' ? body.id.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configure' }, { status: 503 })

  const { data: entree, error: erreurLecture } = await sb
    .from('instagram_scheduled_posts')
    .select('id, image_url, caption, status, metadata')
    .eq('id', id)
    .maybeSingle()

  if (erreurLecture) {
    console.error('[instagram/publish] lecture', erreurLecture)
    return NextResponse.json({ error: 'Lecture de la file refusee par la base' }, { status: 500 })
  }
  if (!entree) return NextResponse.json({ error: 'Entree introuvable' }, { status: 404 })
  if (entree.status === 'published') {
    return NextResponse.json({ error: 'Deja publiee' }, { status: 409 })
  }
  if (!entree.image_url) {
    return NextResponse.json({ error: 'Entree sans media : rien a publier' }, { status: 422 })
  }

  const resultat = await publierEntreeFile({
    image_url: entree.image_url,
    caption: entree.caption,
    metadata: (entree.metadata as { type?: string; children?: string[]; video_url?: string } | null) ?? null,
  })

  const maintenant = new Date().toISOString()

  if (!resultat.ok) {
    // L'echec s'ecrit dans la file : le cron ne rejouera pas l'entree, et la
    // raison reste visible dans le panneau apres rechargement.
    const { error: erreurStatut } = await sb
      .from('instagram_scheduled_posts')
      .update({ status: 'failed', error_message: resultat.raison.slice(0, 1000), updated_at: maintenant })
      .eq('id', id)
    if (erreurStatut) console.error('[instagram/publish] statut echec non enregistre', erreurStatut)

    return NextResponse.json({ error: 'Publication refusee par Meta', detail: resultat.raison }, { status: 502 })
  }

  const { error: erreurStatut } = await sb
    .from('instagram_scheduled_posts')
    .update({
      status: 'published',
      published_at: maintenant,
      permalink: resultat.post.permalink || null,
      error_message: null,
      updated_at: maintenant,
    })
    .eq('id', id)

  if (erreurStatut) {
    // Le post existe sur Instagram mais la file ne le sait pas : le dire, sinon
    // un second clic — ou le cron — publierait un doublon.
    console.error('[instagram/publish] statut publie non enregistre', erreurStatut)
    return NextResponse.json(
      {
        success: true,
        post: resultat.post,
        avertissement:
          'Publie sur Instagram, mais la file n a pas pu etre mise a jour : ne pas republier cette entree.',
      },
      { status: 200 }
    )
  }

  return NextResponse.json({ success: true, post: resultat.post })
}

/** GET — dit au panneau si la publication est possible, sans rien publier. */
export async function GET(req: NextRequest) {
  const refus = await requireCmsAuth(req)
  if (refus) return refus
  return NextResponse.json({
    configured: isInstagramConfigured(),
    manque: isInstagramConfigured()
      ? []
      : ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_BUSINESS_ACCOUNT_ID'].filter((k) => !process.env[k]),
  })
}
