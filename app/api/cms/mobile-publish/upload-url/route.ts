export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCmsAuthStatus } from '@/lib/cms-auth'

/**
 * POST /api/cms/mobile-publish/upload-url
 *
 * Delivre des URL de televersement signees, pour que l'application depose ses
 * fichiers directement dans Supabase Storage.
 *
 * Les medias transitaient jusqu'ici par /api/cms/mobile-publish en multipart.
 * Les fonctions Vercel plafonnent la requete a 4,5 Mo : une photo de telephone
 * pese 3 a 8 Mo et passait rarement, une video jamais — la reponse etait un
 * FUNCTION_PAYLOAD_TOO_LARGE brut, emis avant meme d'atteindre le code.
 *
 * La limite ne se releve pas. On sort donc le transfert du chemin serveur :
 * seul le nom des fichiers y passe, les octets vont de l'appareil au stockage.
 */

const BUCKET = 'media'

// Garde-fou de forme, pas de securite : l'URL signee ne vaut que pour le
// chemin demande, et le stockage applique ses propres limites de taille.
const MAX_FICHIERS = 10

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  return url && key ? createClient(url, key) : null
}

export async function POST(req: NextRequest) {
  if ((await getCmsAuthStatus(req)) !== 'ok') {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configure' }, { status: 503 })

  const { fichiers } = (await req.json().catch(() => ({}))) as { fichiers?: string[] }

  if (!Array.isArray(fichiers) || fichiers.length === 0) {
    return NextResponse.json({ error: 'Liste `fichiers` requise' }, { status: 400 })
  }
  if (fichiers.length > MAX_FICHIERS) {
    return NextResponse.json({ error: `Maximum ${MAX_FICHIERS} fichiers par envoi` }, { status: 400 })
  }

  const cibles = []

  for (const nom of fichiers) {
    // Le nom vient du telephone : on ne garde que des caracteres surs et on
    // prefixe d'un horodatage, pour qu'aucun envoi n'ecrase le precedent.
    const sain = String(nom).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'media.jpg'
    const chemin = `mobile/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sain}`

    const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(chemin)
    if (error) {
      return NextResponse.json(
        { error: `URL de televersement refusee pour ${sain} : ${error.message}` },
        { status: 502 }
      )
    }

    cibles.push({
      nom: sain,
      chemin,
      signedUrl: data.signedUrl,
      token: data.token,
      url: sb.storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl,
    })
  }

  return NextResponse.json({ bucket: BUCKET, cibles })
}
