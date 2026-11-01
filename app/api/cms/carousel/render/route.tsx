import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'

import { requireCmsAuth } from '@/lib/cms-auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { POLICES_REQUISES, SlideMarkup } from '@/lib/carousel/slide-markup'
import {
  DIMENSIONS,
  cleStockage,
  dimensionsPour,
  formatValide,
  normaliserSlides,
  slidesTrouees,
} from '@/lib/carousel/slide-model'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Un carrousel de 10 slides = 10 rendus Satori, 10 encodages JPEG et 10 envois.
export const maxDuration = 120

const BUCKET = 'media'
const QUALITE_JPEG = 92

/**
 * POST /api/cms/carousel/render — transforme des slides en JPEG hébergés.
 *
 * C'est la pièce qui manquait entre le Cerveau et Instagram. Le Cerveau produit
 * des slides en JSON ; Instagram n'accepte qu'une image JPEG à une URL publique
 * qu'il télécharge lui-même. Sans ce rendu, publier un carrousel depuis le
 * Cerveau demandait de coller à la main l'URL d'une image — c'est-à-dire de
 * préparer l'image ailleurs, ce que personne ne faisait.
 *
 * Satori (`next/og`) rend en PNG uniquement, et Meta refuse le PNG. D'où la
 * conversion explicite en JPEG : ce n'est pas une optimisation, c'est la
 * condition d'acceptation.
 *
 * Body : { slides: SlideRenderer[], format?: 'feed' | 'story', prefixe?: string }
 * Réponse : { ok, format, width, height, count, urls }
 */
export async function POST(request: NextRequest) {
  const refus = await requireCmsAuth(request)
  if (refus) return refus

  // Chaque appel encode plusieurs images en pleine résolution : borné, comme les
  // routes de génération.
  if (!rateLimit(getClientIp(request), 6, 60_000)) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase non configuré', detail: 'NEXT_PUBLIC_SUPABASE_URL ou clé service manquante' },
      { status: 503 }
    )
  }

  let corps: Record<string, unknown>
  try {
    corps = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const format = formatValide(corps.format)
  const prefixe = typeof corps.prefixe === 'string' ? corps.prefixe : 'carrousel'
  const slides = normaliserSlides(corps.slides)

  if (slides.length === 0) {
    return NextResponse.json({ error: 'Aucune slide exploitable (chacune doit avoir un titre)' }, { status: 400 })
  }

  // Un corps qui n'est pas en UTF-8 fait disparaitre des caracteres sans rien
  // signaler : la slide part avec un trou au milieu d'un mot. Mieux vaut refuser
  // et le dire que publier un visuel ampute — le rendu, lui, ne se plaint pas.
  const trouees = slidesTrouees(slides)
  if (trouees.length > 0) {
    return NextResponse.json(
      {
        error: 'Texte non UTF-8 : des caracteres ont ete remplaces',
        detail: `slides concernees : ${trouees.join(', ')}. Envoyer le corps en UTF-8 (Content-Type: application/json; charset=utf-8).`,
      },
      { status: 400 }
    )
  }

  let polices
  try {
    polices = chargerPolices()
  } catch (erreur) {
    // Dire quel fichier manque : sans police, Satori rend quand meme, avec un
    // visuel qui ne ressemble plus a la marque et aucune erreur visible.
    return NextResponse.json(
      {
        error: 'Polices de rendu introuvables',
        detail: `${(erreur as Error).message} (attendu dans public/fonts, deploye via outputFileTracingIncludes)`,
      },
      { status: 500 }
    )
  }

  const { width, height } = dimensionsPour(format)
  const sb = createClient(supabaseUrl, serviceKey)
  const urls: string[] = []
  const horodatage = Date.now()

  for (let i = 0; i < slides.length; i++) {
    let jpeg: Buffer
    try {
      const rendu = new ImageResponse(
        <SlideMarkup slide={slides[i]} index={i} total={slides.length} format={format} />,
        { width, height, fonts: polices }
      )
      const png = Buffer.from(await rendu.arrayBuffer())
      jpeg = await sharp(png).jpeg({ quality: QUALITE_JPEG, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer()
    } catch (erreur) {
      console.error('[carousel/render] rendu de la slide', i + 1, erreur)
      return NextResponse.json(
        { error: `Rendu impossible pour la slide ${i + 1}`, detail: (erreur as Error).message },
        { status: 500 }
      )
    }

    const cle = cleStockage(prefixe, i, slides.length, horodatage)
    const { error: erreurEnvoi } = await sb.storage
      .from(BUCKET)
      .upload(cle, jpeg, { contentType: 'image/jpeg', upsert: false })

    if (erreurEnvoi) {
      console.error('[carousel/render] envoi du media', cle, erreurEnvoi)
      // Les slides deja envoyees sont retirees : un rendu partiel ne doit pas
      // laisser des images orphelines dans le bucket public.
      if (urls.length > 0) {
        const clesEnvoyees = Array.from({ length: urls.length }, (_, k) => cleStockage(prefixe, k, slides.length, horodatage))
        const { error: erreurNettoyage } = await sb.storage.from(BUCKET).remove(clesEnvoyees)
        if (erreurNettoyage) console.error('[carousel/render] nettoyage partiel non abouti', erreurNettoyage)
      }
      return NextResponse.json(
        { error: `Envoi du media refuse par la base : ${erreurEnvoi.message}` },
        { status: 500 }
      )
    }

    urls.push(sb.storage.from(BUCKET).getPublicUrl(cle).data.publicUrl)
  }

  return NextResponse.json({
    ok: true,
    format,
    width,
    height,
    count: urls.length,
    urls,
  })
}

/** GET — ce que la route sait faire, sans rien rendre ni rien écrire. */
export async function GET(request: NextRequest) {
  const refus = await requireCmsAuth(request)
  if (refus) return refus

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  return NextResponse.json({
    ok: true,
    configured: Boolean(serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL),
    bucket: BUCKET,
    formats: Object.keys(DIMENSIONS),
    dimensions: DIMENSIONS,
    polices: POLICES_REQUISES.map((p) => p.fichier),
  })
}

type PolicesRendu = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']

let cachePolices: PolicesRendu | null = null

/**
 * Charge les TTF depuis `public/fonts` et les garde en mémoire.
 *
 * Lecture disque et non requête HTTP vers le site : en mode maintenance, le
 * middleware intercepte les chemins publics, et un rendu qui échouerait alors
 * — au moment précis où l'on publie — serait un piège silencieux.
 */
function chargerPolices(): PolicesRendu {
  if (cachePolices) return cachePolices

  const dossier = path.join(process.cwd(), 'public', 'fonts')
  const polices = POLICES_REQUISES.map((police) => {
    const chemin = path.join(dossier, police.fichier)
    if (!fs.existsSync(chemin)) {
      throw new Error(`police absente : ${chemin}`)
    }
    return {
      name: police.name,
      weight: police.weight,
      style: 'normal' as const,
      data: fs.readFileSync(chemin),
    }
  })

  cachePolices = polices as PolicesRendu
  return cachePolices
}
