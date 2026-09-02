export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCmsAuthStatus } from '@/lib/cms-auth'

// Auth identique à auto-publish : CRON_SECRET / x-cms-auth / cookie session
async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Automatisations serveur : en-tête Bearer signé par CRON_SECRET.
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (cronSecret && req.headers.get('authorization') === `Bearer ${cronSecret}`) return true

  // Application mobile et panel : mot de passe en en-tête `x-cms-auth`, ou
  // cookie de session dont getCmsAuthStatus vérifie la signature HMAC.
  //
  // Les deux contrôles écrits ici auparavant ouvraient la route à tous :
  //   · `process.env.CMS_PASSWORD || 'heldonica2026'` — repli codé en dur dans
  //     un dépôt public ;
  //   · `cookie.includes('heldonica_cms_session')` — ne testait que la présence
  //     du *nom* du cookie, sans regarder sa valeur. Poser
  //     `heldonica_cms_session=x` suffisait donc à televerser des fichiers,
  //     creer des articles et publier sur le compte Instagram.
  return (await getCmsAuthStatus(req)) === 'ok'
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * POST /api/cms/mobile-publish — 0€ (OSM, pas Places), auto+manuel
 * FormData:
 *  photos[] (1-10 images), video? (1 mp4), caption?, place_title?, place_lat?, place_lng?, place_address?,
 *  publish_instagram? (0/1), is_carousel? (0/1), auto_caption? (0/1), mode? (manuel|auto|both)
 * Règle n°1 : published toujours false. Instagram en draft uniquement. Auto IA seulement si auto_caption=1.
 */
export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé (x-cms-auth ou Bearer CRON_SECRET requis)' }, { status: 401 })
  }

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  try {
    const form = await req.formData()
    const files = form.getAll('photos') as File[]
    const videoFile = form.get('video') as File | null
    const caption = (form.get('caption') as string) || ''
    const placeTitle = (form.get('place_title') as string) || ''
    const placeLat = form.get('place_lat') ? parseFloat(form.get('place_lat') as string) : null
    const placeLng = form.get('place_lng') ? parseFloat(form.get('place_lng') as string) : null
    const placeAddress = (form.get('place_address') as string) || ''
    const publishInstagram = form.get('publish_instagram') === '1'
    const isCarousel = form.get('is_carousel') === '1' || files.length > 1
    const autoCaption = form.get('auto_caption') === '1'
    const mode = (form.get('mode') as string) || (autoCaption ? 'both' : 'manuel')

    const hasPhotos = files && files.length > 0
    const hasVideo = !!videoFile && videoFile.size > 0
    if (!hasPhotos && !hasVideo) {
      return NextResponse.json({ error: 'Aucun média fourni (photos[] ou video)' }, { status: 400 })
    }
    if (files.length > 10) {
      return NextResponse.json({ error: 'Max 10 photos par upload (carousel IG: 2-10)' }, { status: 400 })
    }
    if (hasVideo && videoFile && videoFile.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'Vidéo trop lourde (>100MB)' }, { status: 400 })
    }

    // 0. Auto caption IA (optionnel, gratuit via cascade Groq→Gemini) — sinon squelette [À TOI]
    let aiCaption: string | null = null
    let aiCarouselCaptions: string[] | null = null
    if (autoCaption) {
      try {
        const { generateAiCompletion } = await import('@/lib/ai-provider')
        const { HELDONICA_B2C_PROMPT } = await import('@/lib/brand-voice')
        if (isCarousel && files.length >= 2) {
          // Carrousel : 1 caption globale + légendes par slide
          const prompt = `${HELDONICA_B2C_PROMPT}\nLieu: ${placeTitle} — ${placeAddress}. ${files.length} photos terrain. Note utilisateur: "${caption}". Génère JSON {"caption":"Légende IG globale 120-180 mots, pronoms on/tu, 0 mot banni","slides":["Légende slide 1","..."]} sans inventer prix/horaires, mets [À TOI] si incertain.`
          const res = await generateAiCompletion({ messages: [{ role: 'user', content: prompt }], temperature: 0.6, max_tokens: 800, jsonMode: true })
          const parsed = JSON.parse(res.content.match(/\{[\s\S]*\}/)?.[0] || '{}')
          aiCaption = parsed.caption || null
          aiCarouselCaptions = Array.isArray(parsed.slides) ? parsed.slides.slice(0, files.length) as string[] : null
        } else if (hasVideo) {
          const prompt = `${HELDONICA_B2C_PROMPT}\nVidéo terrain à ${placeTitle}. Note: "${caption}". Génère JSON {"caption":"Légende Reels 80-120 mots, on/tu, 0 mot banni, [À TOI] si prix/horaire incertain"}.`
          const res = await generateAiCompletion({ messages: [{ role: 'user', content: prompt }], temperature: 0.6, max_tokens: 500, jsonMode: true })
          aiCaption = JSON.parse(res.content.match(/\{[\s\S]*\}/)?.[0] || '{}').caption || null
        } else if (hasPhotos) {
          const prompt = `${HELDONICA_B2C_PROMPT}\nPhoto terrain à ${placeTitle} — ${placeAddress}. Note: "${caption}". Génère JSON {"caption":"Légende IG 80-120 mots, on/tu, 0 mot banni"}.`
          const res = await generateAiCompletion({ messages: [{ role: 'user', content: prompt }], temperature: 0.6, max_tokens: 500, jsonMode: true })
          aiCaption = JSON.parse(res.content.match(/\{[\s\S]*\}/)?.[0] || '{}').caption || null
        }
      } catch (e) { console.warn('[mobile-publish] auto caption failed', e) }
    }

    // 1. Upload vers Supabase Storage (gratuit, même bucket que auto-publish)
    const uploadedUrls: string[] = []
    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer())
      if (bytes.length > 15 * 1024 * 1024) {
        return NextResponse.json({ error: `Fichier trop lourd: ${file.name} (>15MB)` }, { status: 400 })
      }
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const key = `mobile/${Date.now()}-${safe}`
      const { error } = await sb.storage.from('media').upload(key, bytes, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })
      if (error) return NextResponse.json({ error: `Upload failed ${file.name}: ${error.message}` }, { status: 500 })
      const { data } = sb.storage.from('media').getPublicUrl(key)
      uploadedUrls.push(data.publicUrl)

      // Trace cms_media (pour photos_evidence.py)
      await (sb as any).from('cms_media').insert({
        filename: safe,
        file_path: data.publicUrl,
        file_type: file.type || 'image/jpeg',
        file_size: bytes.length,
        source: 'mobile',
        metadata: { place_title: placeTitle, place_lat: placeLat, place_lng: placeLng, caption },
      })
    }

    const primaryImage = uploadedUrls[0] || null

    // 1b. Upload vidéo si présente
    let videoUrl: string | null = null
    if (hasVideo && videoFile) {
      const bytes = Buffer.from(await videoFile.arrayBuffer())
      const safe = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'video.mp4'
      const key = `mobile/${Date.now()}-${safe}`
      const { error } = await sb.storage.from('media').upload(key, bytes, { contentType: videoFile.type || 'video/mp4', upsert: false })
      if (error) return NextResponse.json({ error: `Upload vidéo failed: ${error.message}` }, { status: 500 })
      const { data } = sb.storage.from('media').getPublicUrl(key)
      videoUrl = data.publicUrl
      await (sb as any).from('cms_media').insert({ filename: safe, file_path: videoUrl, file_type: videoFile.type || 'video/mp4', file_size: bytes.length, source: 'mobile', metadata: { place_title: placeTitle, video: true } })
    }

    // 2. POI si lieu fourni (gratuit via OSM côté Android, on stocke tel quel)
    let poiId: string | null = null
    if (placeTitle && placeLat !== null && placeLng !== null) {
      const { data: poi } = await (sb as any)
        .from('article_map_pois')
        .insert({
          content_slug: 'mobile-inbox',
          name: placeTitle.slice(0, 120),
          category: 'point_vue',
          lat: placeLat,
          lng: placeLng,
          address: placeAddress.slice(0, 300),
          source: 'mobile',
          metadata: { uploaded_urls: uploadedUrls, caption },
        })
        .select('id')
        .single()
      poiId = poi?.id || null
    }

    // 3. Brouillon strict (jamais publié)
    const slugBase = (placeTitle || 'carnet-mobile')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'carnet-mobile'
    const slug = `${slugBase}-${Date.now().toString().slice(-6)}`

    // Contenu squelette — AUCUNE invention, juste faits + balises [À TOI] + auto si demandé
    const manualBlock = `<p><em>Brouillon mobile — terrain du ${new Date().toISOString().slice(0, 10)}.</em></p>
<p>Étape : <strong>${placeTitle || '[À TOI : nom du lieu]'}</strong> — ${placeAddress || '[À TOI : adresse]'} (${placeLat ?? '?'}, ${placeLng ?? '?'})</p>
${hasPhotos ? `<p>Photos : ${uploadedUrls.length} média(s) — ${isCarousel ? 'carrousel' : 'image'} — voir galerie.</p><ul>${uploadedUrls.map((u, i) => `<li><img src="${u}" alt="${aiCarouselCaptions?.[i] || '[À TOI : décris la photo]'}" /></li>`).join('')}</ul>` : ''}
${hasVideo ? `<p>Vidéo : <a href="${videoUrl}">voir vidéo</a></p><video src="${videoUrl}" controls></video>` : ''}
<p>[À TOI : odeur, lumière, prix réel, ce qu'on a moins aimé]</p>
<p>${caption ? `Note mobile : ${caption}` : '[À TOI : récit vécu]'}</p>`
    const autoBlock = aiCaption ? `<hr/><p><em>Proposition IA (à valider, 0 mot banni) :</em> ${aiCaption}</p>` : ''
    const bothBlock = mode === 'both' && aiCaption ? `${manualBlock}${autoBlock}` : mode === 'auto' && aiCaption ? autoBlock : manualBlock
    const content = bothBlock

    const { data: post, error: insertErr } = await (sb as any)
      .from('cms_blog_posts')
      .insert({
        title: placeTitle ? `Carnet : ${placeTitle}` : 'Carnet mobile (à titrer)',
        slug,
        excerpt: caption.slice(0, 160) || `Brouillon mobile — ${uploadedUrls.length} photo(s) à ${placeTitle || 'lieu à préciser'}.`,
        content,
        category: 'Carnets Voyage',
        featured_image: primaryImage,
        published: false,
        status: 'draft',
        tags: ['mobile', 'brouillon-media'],
        source: 'mobile',
        source_metadata: { place: { title: placeTitle, lat: placeLat, lng: placeLng, address: placeAddress }, poi_id: poiId, uploaded_urls: uploadedUrls },
      })
      .select('id, slug')
      .single()

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    // 4. Instagram : jamais publish direct depuis mobile. Draft pour validation 1-clic. Support carrousel + vidéo
    let instagramScheduled: any = null
    if (publishInstagram) {
      const baseCaption = aiCaption || caption
      const igCaption = baseCaption
        ? `${baseCaption}\n\n📍 ${placeTitle || ''}\n🌍 heldonica.fr/blog/${slug}\n#slowtravel #heldonica`
        : `📍 ${placeTitle || 'Carnet mobile'}\n[À TOI]\n🌍 heldonica.fr/blog/${slug}\n#slowtravel #heldonica`
      if (hasVideo && videoUrl) {
        const { data: ig } = await (sb as any).from('instagram_scheduled_posts').insert({ image_url: videoUrl, caption: igCaption.slice(0, 2200), status: 'draft', article_id: null, metadata: { type: 'REELS', video_url: videoUrl } }).select('id').single()
        instagramScheduled = ig
      } else if (isCarousel && uploadedUrls.length >= 2) {
        const { data: ig } = await (sb as any).from('instagram_scheduled_posts').insert({ image_url: primaryImage!, caption: igCaption.slice(0, 2200), status: 'draft', article_id: null, metadata: { type: 'CAROUSEL', children: uploadedUrls } }).select('id').single()
        instagramScheduled = ig
      } else if (primaryImage) {
        const { data: ig } = await (sb as any).from('instagram_scheduled_posts').insert({ image_url: primaryImage, caption: igCaption.slice(0, 2200), status: 'draft', article_id: null }).select('id').single()
        instagramScheduled = ig
      }
    }

    return NextResponse.json({
      success: true,
      post: { id: post.id, slug: post.slug, status: 'draft' },
      uploadedUrls,
      videoUrl,
      poiId,
      isCarousel,
      aiCaption,
      aiCarouselCaptions,
      mode,
      instagramScheduled,
      message: 'Brouillon créé (published:false). Valide dans /panel-manager avant publication.',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    usage: 'POST multipart/form-data: photos[] (1-10), video? (mp4), place_title?, place_lat/lng/address?, caption?, publish_instagram? (0/1), is_carousel? (0/1), auto_caption? (0/1), mode? (manuel|auto|both). Header: x-cms-auth: $CMS_PASSWORD. Auto utilise cascade Groq→Gemini gratuite, sinon squelette [À TOI].',
  })
}
