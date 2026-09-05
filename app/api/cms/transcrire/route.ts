import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'

/**
 * Transcription d'une vidéo, par Whisper.
 *
 * Remplace ce que l'éditeur de sous-titres faisait avant : insérer six lignes
 * écrites en dur — « Bienvenue dans cette aventure », « au cœur du Portugal » —
 * quelle que soit la vidéo chargée, et exportables telles quelles. Ici, ce qui
 * sort est ce qui a été dit.
 *
 * Groq accepte une URL et va chercher le fichier lui-même : la fonction n'a donc
 * ni à le télécharger ni à le retransmettre. C'est ce qui rend l'opération
 * possible sur Vercel, dont la requête entrante plafonne à 4,5 Mo — une vidéo
 * n'y passerait jamais.
 *
 * La clé reste ici : le navigateur dépose le fichier par URL signée, puis
 * n'envoie que son adresse.
 */

// La transcription d'un Reel prend quelques secondes ; le défaut de 10 s est
// trop juste dès qu'une file d'attente s'en mêle.
export const maxDuration = 60

const GROQ = 'https://api.groq.com/openai/v1/audio/transcriptions'

/** Un segment tel que l'éditeur l'attend. */
type Segment = { debut: number; fin: number; texte: string }

export async function POST(req: NextRequest) {
  const refus = await requireCmsAuth(req)
  if (refus) return refus

  const cle = process.env.GROQ_API_KEY?.trim()
  if (!cle) {
    return NextResponse.json(
      { error: "La transcription n'est pas configurée : GROQ_API_KEY manquante." },
      { status: 503 }
    )
  }

  const { url, langue } = (await req.json().catch(() => ({}))) as {
    url?: string
    langue?: string
  }

  if (!url) {
    return NextResponse.json({ error: 'Adresse du fichier requise.' }, { status: 400 })
  }

  // L'adresse vient du client : on n'accepte que le stockage du projet, pour
  // que cette route ne serve pas à faire télécharger n'importe quoi par Groq
  // aux frais du compte.
  let hote: string
  try {
    const analysee = new URL(url)
    if (analysee.protocol !== 'https:') throw new Error('protocole')
    hote = analysee.hostname
  } catch {
    return NextResponse.json({ error: 'Adresse invalide.' }, { status: 400 })
  }
  if (!hote.endsWith('.supabase.co')) {
    return NextResponse.json(
      { error: 'Seuls les fichiers déposés sur le stockage du site sont acceptés.' },
      { status: 403 }
    )
  }

  const formulaire = new FormData()
  formulaire.set('url', url)
  formulaire.set('model', 'whisper-large-v3')
  formulaire.set('response_format', 'verbose_json')
  // Le français par défaut : sans indication, Whisper devine, et se trompe sur
  // les passages courts ou bruyants.
  formulaire.set('language', langue || 'fr')

  try {
    const reponse = await fetch(GROQ, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}` },
      body: formulaire,
    })

    if (!reponse.ok) {
      const detail = await reponse.text()
      console.error('[transcrire] Groq a refusé', reponse.status, detail.slice(0, 300))
      return NextResponse.json(
        {
          error:
            reponse.status === 413
              ? 'Fichier trop lourd pour la transcription (25 Mo maximum).'
              : "La transcription a échoué.",
        },
        { status: 502 }
      )
    }

    const donnees = await reponse.json()

    const segments: Segment[] = Array.isArray(donnees?.segments)
      ? donnees.segments
          .map((s: any) => ({
            debut: Number(s.start) || 0,
            fin: Number(s.end) || 0,
            texte: String(s.text ?? '').trim(),
          }))
          .filter((s: Segment) => s.texte.length > 0)
      : []

    if (segments.length === 0) {
      return NextResponse.json(
        { error: "Aucune parole détectée dans cette vidéo." },
        { status: 422 }
      )
    }

    return NextResponse.json({ segments, langue: donnees?.language ?? null })
  } catch (e) {
    console.error('[transcrire] appel impossible', e)
    return NextResponse.json({ error: 'Service de transcription injoignable.' }, { status: 502 })
  }
}
