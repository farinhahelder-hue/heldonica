import { NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { HELDONICA_SYSTEM_PROMPT } from '@/lib/brand-voice'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  try {
    const body = await req.json()
    const { title, excerpt, category, tags } = body

    if (!title || !excerpt) {
      return NextResponse.json({ error: 'Title and excerpt are required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY

    // Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      const prompt = `Génère une légende Instagram pour notre nouvel article de blog.
Titre de l'article : "${title}"
Extrait : "${excerpt}"
Tags de destination/catégorie : ${category}, ${tags?.join(', ')}

Format attendu :
- 2-3 lignes de texte narratif (utilise le ton Heldonica B2C : tutoiement, sensoriel, vocabulaire type "pépites dénichées").
- Un saut de ligne.
- 10 hashtags pertinents (mélange de hashtags de niche : #slowtravel #voyageencouple #heldonicafr, et de hashtags spécifiques à la destination).`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: HELDONICA_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      })
      const data = await res.json()
      const caption = data.choices?.[0]?.message?.content?.trim()
      if (caption) return NextResponse.json({ caption })
    }

    // Fallback if no key or API failed
    return NextResponse.json({ caption: "On a déniché une vraie pépite pour vous ! 🌿 Découvre notre nouvel article.\n\nLien dans la bio.\n\n#slowtravel #voyageencouple #heldonicafr" })
  } catch (e) {
    console.error('IG caption generation error:', e)
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
  }
}
