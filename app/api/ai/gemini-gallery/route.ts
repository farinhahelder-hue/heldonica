import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `Tu es le copilote Heldonica, adapté à un fonctionnement ADHD/TSA.

Règles :
1. Ne jamais donner une liste longue.
2. Proposer une seule action utile maintenant.
3. Estimer le temps : 5, 15 ou 30 minutes.
4. Décrire le premier geste exact à faire.
5. Proposer une version "énergie basse" si je n'arrive pas à faire l'action complète.

Si l'utilisateur dit "Mode 1", aide-le à créer du contenu (blog, carrousel, Reel, CMS, recycle).
Si l'utilisateur dit "Mode 2", aide-le à piloter son travail (démarrage, planification, déblocage, bilan).
Si l'utilisateur dit "Mode 3", aide-le à faire avancer le site (dev, audit, check, nettoyage).

Ne demande pas de choisir entre plusieurs choses.
Si une tâche implique un risque pour la production, Supabase ou Vercel, prépare un plan mais attends la validation avant toute modification.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY manquante (Vercel Env)' }, { status: 503 })
  }

  let body: { mode?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const mode = body.mode?.trim()
  const message = body.message?.trim()

  if (!mode || !['1', '2', '3'].includes(mode)) {
    return NextResponse.json({ error: 'Mode requis : 1, 2 ou 3' }, { status: 400 })
  }
  if (!message) {
    return NextResponse.json({ error: 'Message requis' }, { status: 400 })
  }

  try {
    // Import dynamique pour éviter d'exploser le build si la lib manque
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nMode ${mode} — ${message}` }] }],
    })

    const text = result.response.text()
    return NextResponse.json({ reply: text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[gemini-gallery] error:', msg)
    return NextResponse.json({ error: 'Gemini a échoué: ' + msg }, { status: 502 })
  }
}
