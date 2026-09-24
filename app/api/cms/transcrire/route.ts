import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { estInvente } from '@/lib/transcription-filtre'

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

    // verbose_json porte, pour chaque segment, ce que Whisper pense de sa
    // propre sortie. On ne la lisait pas : c'est là que se voit l'invention.
    const bruts = Array.isArray(donnees?.segments)
      ? donnees.segments
          .map((s: any) => ({
            debut: Number(s.start) || 0,
            fin: Number(s.end) || 0,
            texte: String(s.text ?? '').trim(),
            probaSilence: Number(s.no_speech_prob ?? 0),
            vraisemblance: Number(s.avg_logprob ?? 0),
          }))
          .filter((s: { texte: string }) => s.texte.length > 0)
      : []

    const inventes = bruts.filter(estInvente)
    const segments: Segment[] = bruts
      .filter((s: (typeof bruts)[number]) => !estInvente(s))
      .map(({ debut, fin, texte }: (typeof bruts)[number]) => ({ debut, fin, texte }))

    if (inventes.length > 0) {
      // Tracé : si le filtre se met à manger de la vraie parole, c'est ici
      // qu'on le verra, et non dans une vidéo muette sans explication.
      console.warn(
        '[transcrire] segments écartés comme inventés',
        inventes.map((s: (typeof bruts)[number]) => ({
          texte: s.texte.slice(0, 80),
          probaSilence: s.probaSilence,
          vraisemblance: s.vraisemblance,
        }))
      )
    }

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
