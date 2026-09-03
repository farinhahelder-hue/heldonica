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
 * Lieu et date de prise de vue, lus dans le fichier lui-meme.
 *
 * L'EXIF prime sur les coordonnees du formulaire et sur l'heure d'envoi : il
 * atteste ou et quand la photo a ete prise, la ou l'heure d'upload daterait du
 * jour meme une image vieille de deux ans. C'est cette distinction qui fait la
 * valeur du registre de preuves.
 *
 * Le formulaire sert de repli quand le telephone n'a pas geolocalise le cliche.
 */
async function lireMetadonnees(bytes: Buffer, repli: { lat: number | null; lng: number | null }) {
  try {
    const exifr = (await import('exifr')).default
    const d = await exifr.parse(bytes, { gps: true, exif: true })
    const prise: Date | undefined = d?.DateTimeOriginal || d?.CreateDate
    const gpsExif = typeof d?.latitude === 'number' && typeof d?.longitude === 'number'

    return {
      latitude: gpsExif ? d.latitude : repli.lat,
      longitude: gpsExif ? d.longitude : repli.lng,
      // Pas de repli sur l'heure d'envoi : mieux vaut une date absente qu'une
      // date fausse, que le controle du vecu prendrait pour une preuve.
      taken_at: prise instanceof Date && !isNaN(prise.valueOf()) ? prise.toISOString() : null,
      // Origine determinee ici plutot que deduite d'une comparaison de valeurs :
      // sans GPS ni dans le fichier ni dans le formulaire, une comparaison
      // conclurait a tort a une provenance EXIF.
      geo_source: gpsExif ? 'exif' : repli.lat !== null ? 'formulaire' : 'aucune',
    }
  } catch {
    return {
      latitude: repli.lat,
      longitude: repli.lng,
      taken_at: null,
      geo_source: repli.lat !== null ? 'formulaire' : 'aucune',
    }
  }
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

    // Références aux fichiers déjà déposés via les URL signées. L'application
    // envoie leur description en JSON ; les octets, eux, ne passent plus par
    // ici — c'est ce qui permet de depasser la limite de 4,5 Mo de Vercel.
    type PreUpload = {
      nom: string
      chemin: string
      url: string
      mime?: string
      taille?: number
      lat?: number | null
      lng?: number | null
      priseDeVue?: string | null
    }

    let preUploads: PreUpload[] = []
    const brutPre = form.get('uploaded') as string | null
    if (brutPre) {
      try {
        const parse = JSON.parse(brutPre)
        // On ne garde que les entrées exploitables : sans chemin ni URL, la
        // ligne de traçage pointerait dans le vide.
        preUploads = Array.isArray(parse)
          ? parse.filter((p: PreUpload) => p?.chemin && p?.url)
          : []
      } catch {
        return NextResponse.json({ error: 'Champ `uploaded` illisible (JSON attendu)' }, { status: 400 })
      }
    }
    const caption = (form.get('caption') as string) || ''
    const placeTitle = (form.get('place_title') as string) || ''
    const placeLat = form.get('place_lat') ? parseFloat(form.get('place_lat') as string) : null
    const placeLng = form.get('place_lng') ? parseFloat(form.get('place_lng') as string) : null
    const placeAddress = (form.get('place_address') as string) || ''
    const publishInstagram = form.get('publish_instagram') === '1'
    // Total des deux voies : les photos pre-deposees ne passent pas par
    // `files`, et les compter a part ferait perdre le mode carrousel.
    const nbPhotos = files.length + preUploads.length
    const isCarousel = form.get('is_carousel') === '1' || nbPhotos > 1
    const autoCaption = form.get('auto_caption') === '1'
    const mode = (form.get('mode') as string) || (autoCaption ? 'both' : 'manuel')

    // Les médias pré-déposés comptent comme des photos présentes : sans cela,
    // un envoi passant par les URL signées serait refusé faute de multipart.
    const hasPhotos = (files && files.length > 0) || preUploads.length > 0
    const hasVideo = !!videoFile && videoFile.size > 0
    if (!hasPhotos && !hasVideo) {
      return NextResponse.json({ error: 'Aucun média fourni (photos[] ou video)' }, { status: 400 })
    }
    if (nbPhotos > 10) {
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
        if (isCarousel && nbPhotos >= 2) {
          // Carrousel : 1 caption globale + légendes par slide
          const prompt = `${HELDONICA_B2C_PROMPT}\nLieu: ${placeTitle} — ${placeAddress}. ${nbPhotos} photos terrain. Note utilisateur: "${caption}". Génère JSON {"caption":"Légende IG globale 120-180 mots, pronoms on/tu, 0 mot banni","slides":["Légende slide 1","..."]} sans inventer prix/horaires, mets [À TOI] si incertain.`
          const res = await generateAiCompletion({ messages: [{ role: 'user', content: prompt }], temperature: 0.6, max_tokens: 800, jsonMode: true })
          const parsed = JSON.parse(res.content.match(/\{[\s\S]*\}/)?.[0] || '{}')
          aiCaption = parsed.caption || null
          aiCarouselCaptions = Array.isArray(parsed.slides) ? parsed.slides.slice(0, nbPhotos) as string[] : null
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

    // 1. Médias déjà déposés dans le stockage par l'application, via les URL
    //    signées de /upload-url. Ce chemin evite la limite de 4,5 Mo par
    //    requete des fonctions Vercel, qui rejetait toute photo de telephone
    //    par un FUNCTION_PAYLOAD_TOO_LARGE emis avant meme d'atteindre ce code.
    //
    //    Le multipart reste accepte plus bas pour les petits fichiers et les
    //    appels directs en ligne de commande.
    const uploadedUrls: string[] = []

    for (const dejaDepose of preUploads) {
      const { error: erreurTrace } = await (sb as any).from('cms_media').insert({
        filename: dejaDepose.nom,
        url: dejaDepose.url,
        path: dejaDepose.chemin,
        mime_type: dejaDepose.mime || 'image/jpeg',
        size: dejaDepose.taille ?? null,
        source: 'mobile',
        // Les coordonnees et la date de prise de vue viennent de l'EXIF lu par
        // l'application : le serveur ne voit plus passer les octets, il ne peut
        // donc plus les extraire lui-meme.
        latitude: dejaDepose.lat ?? placeLat,
        longitude: dejaDepose.lng ?? placeLng,
        taken_at: dejaDepose.priseDeVue ?? null,
        metadata: {
          place_title: placeTitle,
          place_address: placeAddress,
          caption,
          geo_source: dejaDepose.lat != null ? 'exif' : placeLat !== null ? 'formulaire' : 'aucune',
        },
      })

      if (erreurTrace) {
        await sb.storage.from('media').remove([dejaDepose.chemin])
        return NextResponse.json(
          { error: `Media refuse par la base : ${erreurTrace.message}` },
          { status: 422 }
        )
      }

      uploadedUrls.push(dejaDepose.url)
    }

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

      // Trace cms_media, socle du registre de preuves.
      //
      // Les noms de colonnes suivent la table reelle — `url`, `path`,
      // `mime_type`, `size` — et non ceux de la migration d'origine
      // (`file_path`, `file_type`, `file_size`), dont la production a diverge.
      // Ecrite contre la migration, l'insertion echouait a chaque envoi, en
      // silence puisque l'erreur n'etait jamais lue : la photo arrivait dans le
      // stockage, l'application affichait un succes, et aucune trace n'existait.
      //
      // Les coordonnees vont dans latitude/longitude et non dans metadata :
      // c'est la que check-content-evidence lit la preuve du lieu. Rangees
      // ailleurs, les photos prises sur le terrain — le cas d'usage le plus
      // fort de l'application — n'attesteraient rien.
      const meta = await lireMetadonnees(bytes, { lat: placeLat, lng: placeLng })

      const { error: erreurTrace } = await (sb as any).from('cms_media').insert({
        filename: safe,
        url: data.publicUrl,
        path: key,
        mime_type: file.type || 'image/jpeg',
        size: bytes.length,
        source: 'mobile',
        latitude: meta.latitude,
        longitude: meta.longitude,
        taken_at: meta.taken_at,
        metadata: {
          place_title: placeTitle,
          place_address: placeAddress,
          caption,
          // Origine des coordonnees : celles de l'EXIF valent preuve, celles
          // saisies dans l'application restent declaratives.
          geo_source: meta.geo_source,
        },
      })

      if (erreurTrace) {
        // Le fichier vient d'etre televerse mais n'a aucune ligne pour le
        // designer : il n'est atteignable par rien. On le retire.
        //
        // Sans ce nettoyage, chaque tentative laissait une copie derriere elle.
        // Observe sur l'appareil : une contrainte refusee cote base, WorkManager
        // qui rejoue, et 86 fichiers accumules dans le stockage en quelques
        // minutes — pour une seule photo choisie.
        await sb.storage.from('media').remove([key])

        // 422 et non 500 : la requete est bien formee, c'est son contenu que la
        // base refuse. Rejouer a l'identique echouera pareil, et l'application
        // traite les 4xx comme definitifs — la boucle s'arrete.
        return NextResponse.json(
          {
            error: `Media refuse par la base : ${erreurTrace.message}`,
            detail:
              "Verifie que les migrations cms_media sont appliquees (colonnes source, latitude, " +
              "longitude, taken_at, et valeur 'mobile' autorisee pour source).",
          },
          { status: 422 }
        )
      }
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
      const { error: erreurTraceVideo } = await (sb as any).from('cms_media').insert({
        filename: safe,
        url: videoUrl,
        path: key,
        mime_type: videoFile.type || 'video/mp4',
        size: bytes.length,
        source: 'mobile',
        // Une video ne porte pas d'EXIF exploitable par exifr : on retombe sur
        // ce que l'application a transmis, sans dater la prise de vue.
        latitude: placeLat,
        longitude: placeLng,
        taken_at: null,
        metadata: { place_title: placeTitle, place_address: placeAddress, video: true, geo_source: 'formulaire' },
      })

      if (erreurTraceVideo) {
        // Meme logique que pour les photos : un fichier sans ligne pour le
        // designer n'est atteignable par rien, et le laisser ferait grossir le
        // stockage a chaque nouvelle tentative.
        await sb.storage.from('media').remove([key])
        return NextResponse.json(
          { error: `Video refusee par la base : ${erreurTraceVideo.message}` },
          { status: 422 }
        )
      }
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

    if (insertErr) {
      // Une contrainte violee ou une colonne absente ne se resoudra pas en
      // rejouant : la requete repartirait identique. Renvoyer 500 faisait boucler
      // WorkManager, et chaque tour re-televersait les photos — sept copies pour
      // un seul envoi, constate sur l'appareil.
      //
      // 23514 = check_violation, 23502 = not_null_violation, 42703 = colonne
      // inconnue : autant de refus definitifs cote schema.
      const definitif = ['23514', '23502', '42703', '23505'].includes((insertErr as any).code)
      return NextResponse.json(
        {
          error: insertErr.message,
          detail: definitif
            ? "Le schema refuse cet enregistrement. Verifie les contraintes de cms_blog_posts."
            : undefined,
          medias: uploadedUrls,
        },
        { status: definitif ? 422 : 500 }
      )
    }

    // 4. Instagram : jamais publish direct depuis mobile. Draft pour validation 1-clic. Support carrousel + vidéo
    let instagramScheduled: any = null
    // Motif d'echec cote Instagram, remonte a l'appelant.
    //
    // Les trois insertions ci-dessous ne lisaient que `data` : l'erreur etait
    // jetee. Quand la table manquait - ce qui etait le cas - l'application
    // annoncait « brouillon + Instagram cree » alors que seul l'article existait.
    // Un envoi rate se voit desormais.
    let instagramErreur: string | null = null
    if (publishInstagram) {
      const baseCaption = aiCaption || caption
      const igCaption = baseCaption
        ? `${baseCaption}\n\n📍 ${placeTitle || ''}\n🌍 heldonica.fr/blog/${slug}\n#slowtravel #heldonica`
        : `📍 ${placeTitle || 'Carnet mobile'}\n[À TOI]\n🌍 heldonica.fr/blog/${slug}\n#slowtravel #heldonica`

      const entree =
        hasVideo && videoUrl
          ? { image_url: videoUrl, metadata: { type: 'REELS', video_url: videoUrl } }
          : isCarousel && uploadedUrls.length >= 2
            ? { image_url: primaryImage!, metadata: { type: 'CAROUSEL', children: uploadedUrls } }
            : primaryImage
              ? { image_url: primaryImage, metadata: null }
              : null

      if (!entree) {
        instagramErreur = "Aucune image ni video : rien a envoyer sur Instagram."
      } else {
        const { data: ig, error } = await (sb as any)
          .from('instagram_scheduled_posts')
          .insert({
            image_url: entree.image_url,
            caption: igCaption.slice(0, 2200),
            status: 'draft',
            article_id: post.id,
            metadata: entree.metadata,
          })
          .select('id')
          .single()

        if (error) {
          console.error('[mobile-publish] file Instagram', error)
          instagramErreur = "Le brouillon Instagram n'a pas pu etre cree."
        } else {
          instagramScheduled = ig
        }
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
      instagramErreur,
      message: instagramErreur
        ? `Brouillon créé sur le site (published:false). En revanche : ${instagramErreur}`
        : 'Brouillon créé (published:false). Valide dans /panel-manager avant publication.',
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
